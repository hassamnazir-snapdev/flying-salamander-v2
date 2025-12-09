from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import random

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

from backend.database import db
from backend.auth.security import get_current_user
from backend.models.user import UserResponse
from backend.models.meeting import Meeting, MeetingUpdate, MeetingBase
from backend.config import settings

router = APIRouter(
    prefix="/meetings",
    tags=["meetings"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[Meeting])
async def read_meetings(
    current_user: UserResponse = Depends(get_current_user),
    date: Optional[str] = None # Optional date filter YYYY-MM-DD
):
    query = {"user_id": ObjectId(current_user.id)}
    
    # In a real app, we would parse the date and filter by start_time range
    # For now, we'll just return all meetings for the user
    
    meetings = await db.meetings.find(query).to_list(1000)
    return meetings

@router.post("/sync", response_model=dict)
async def sync_meetings(
    source: str = "mock",
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Sync meetings from a source.
    source='mock': Generates sample meeting documents.
    source='google': Syncs from Google Calendar (Real).
    """
    
    # 1. Clear existing meetings for this user before syncing (as requested)
    #    This ensures "mock data" and "real data" don't mix confusingly.
    await db.meetings.delete_many({"user_id": ObjectId(current_user.id)})

    if source == "mock":
        # Generate data relative to "now" to simulate today's schedule
        now = datetime.now()
        today_start = now.replace(hour=9, minute=0, second=0, microsecond=0)
        
        sample_meetings = [
            {
                "google_event_id": f"evt_{random.randint(1000, 9999)}",
                "title": "Daily Standup",
                "start_time": today_start,
                "end_time": today_start + timedelta(minutes=30),
                "is_online": True,
                "location": "Zoom Link: zoom.us/j/12345",
                "participants": ["sarah@example.com", "john@example.com"],
                "summary_link": "https://granola.com/summary/m-0-1",
                "is_recorded": True,
                "status": "pending",
                "user_id": ObjectId(current_user.id)
            },
            {
                "google_event_id": f"evt_{random.randint(1000, 9999)}",
                "title": "Client Pitch - Project Alpha",
                "start_time": today_start + timedelta(hours=2),
                "end_time": today_start + timedelta(hours=3),
                "is_online": True,
                "location": "Google Meet: meet.google.com/abc-defg-hij",
                "participants": ["sarah@example.com", "client@example.com"],
                "summary_link": None,
                "is_recorded": False,
                "status": "unrecorded",
                "user_id": ObjectId(current_user.id)
            },
            {
                "google_event_id": f"evt_{random.randint(1000, 9999)}",
                "title": "Team Brainstorm Session",
                "start_time": today_start + timedelta(hours=5),
                "end_time": today_start + timedelta(hours=6, minutes=30),
                "is_online": False,
                "location": "Conference Room 3B",
                "participants": ["sarah@example.com", "mark@example.com", "lisa@example.com"],
                "summary_link": None,
                "is_recorded": False,
                "status": "offline-pending-input",
                "user_id": ObjectId(current_user.id)
            },
            {
                "google_event_id": f"evt_{random.randint(1000, 9999)}",
                "title": "1:1 with John",
                "start_time": today_start + timedelta(hours=7),
                "end_time": today_start + timedelta(hours=7, minutes=30),
                "is_online": True,
                "location": "Zoom Link: zoom.us/j/67890",
                "participants": ["sarah@example.com", "john@example.com"],
                "summary_link": "https://notion.so/summary/m-0-4",
                "is_recorded": True,
                "status": "processed",
                "user_id": ObjectId(current_user.id)
            }
        ]
        
        # Insert them into the database
        result = await db.meetings.insert_many(sample_meetings)
        return {"message": "Mock data loaded", "synced_count": len(result.inserted_ids)}

    elif source == "google":
        # Check if user has google connected and tokens available
        if not current_user.integrations or not current_user.integrations.google_calendar or not current_user.integrations.google_refresh_token:
             return {"message": "Google Calendar is not connected. Please connect in settings.", "synced_count": 0, "status": "skipped"}

        try:
            # Construct Credentials object
            creds = Credentials(
                token=current_user.integrations.google_access_token,
                refresh_token=current_user.integrations.google_refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
            )

            # Refresh token if expired (though 'googleapiclient' handles this if we pass a Request)
            if creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    # Update DB with new access token if refreshed
                    await db.users.update_one(
                        {"_id": ObjectId(current_user.id)},
                        {"$set": {"integrations.google_access_token": creds.token}}
                    )
                except Exception as e:
                    print(f"Failed to refresh token: {e}")
                    return {"message": "Failed to refresh Google token. Please reconnect.", "synced_count": 0, "status": "error"}

            service = build('calendar', 'v3', credentials=creds)

            # Fetch events for a wider range (Yesterday + Today + Tomorrow) to handle timezone overlaps
            now = datetime.now(timezone.utc)
            start_of_range = now - timedelta(days=1)
            end_of_range = now + timedelta(days=2)
            
            # Formatting to RFC3339 timestamp
            time_min = start_of_range.isoformat().replace("+00:00", "Z")
            time_max = end_of_range.isoformat().replace("+00:00", "Z")

            events_result = service.events().list(
                calendarId='primary', timeMin=time_min, timeMax=time_max,
                singleEvents=True, orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            fetched_meetings = []

            for event in events:
                # Skip cancelled events
                if event.get('status') == 'cancelled':
                    continue
                    
                # Handle all-day events (date vs dateTime)
                start = event.get('start')
                end = event.get('end')
                
                start_dt = start.get('dateTime') or start.get('date') # If date, it's YYYY-MM-DD
                end_dt = end.get('dateTime') or end.get('date')

                # Basic parsing
                try:
                    if 'T' in start_dt:
                        # Parse ISO format (e.g. 2025-12-10T01:00:00+05:00)
                        start_obj = datetime.fromisoformat(start_dt)
                        end_obj = datetime.fromisoformat(end_dt)
                        
                        # Convert to UTC to ensure consistent storage
                        if start_obj.tzinfo:
                            start_obj = start_obj.astimezone(timezone.utc)
                        else:
                            # If naive, assume UTC
                            start_obj = start_obj.replace(tzinfo=timezone.utc)
                            
                        if end_obj.tzinfo:
                            end_obj = end_obj.astimezone(timezone.utc)
                        else:
                            end_obj = end_obj.replace(tzinfo=timezone.utc)

                    else:
                        # All day event (YYYY-MM-DD)
                        # Treat as start of day UTC
                        start_obj = datetime.strptime(start_dt, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                        end_obj = datetime.strptime(end_dt, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                except ValueError:
                    # Fallback
                    start_obj = datetime.now(timezone.utc)
                    end_obj = start_obj + timedelta(hours=1)

                is_online = 'conferenceData' in event or 'location' in event and ('zoom' in event['location'] or 'meet' in event['location'])
                
                attendees = [a.get('email') for a in event.get('attendees', []) if a.get('email')]

                meeting_doc = {
                    "google_event_id": event['id'],
                    "title": event.get('summary', 'No Title'),
                    "start_time": start_obj,
                    "end_time": end_obj,
                    "is_online": is_online,
                    "location": event.get('location'),
                    "participants": attendees,
                    "summary_link": None,
                    "is_recorded": False, # Cannot determine easily from Calendar API
                    "status": "pending",
                    "user_id": ObjectId(current_user.id)
                }
                fetched_meetings.append(meeting_doc)

            if fetched_meetings:
                await db.meetings.insert_many(fetched_meetings)
            
            return {"message": "Google Calendar sync completed", "synced_count": len(fetched_meetings), "status": "success"}

        except Exception as e:
            print(f"Google Sync Error: {e}")
            raise HTTPException(status_code=500, detail=f"Google Sync failed: {str(e)}")
    
    else:
        raise HTTPException(status_code=400, detail="Invalid sync source")

@router.patch("/{meeting_id}/status", response_model=Meeting)
async def update_meeting_status(
    meeting_id: str,
    status_update: MeetingUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    # Verify meeting exists and belongs to user
    meeting = await db.meetings.find_one({"_id": ObjectId(meeting_id), "user_id": ObjectId(current_user.id)})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    update_data = {k: v for k, v in status_update.model_dump().items() if v is not None}
    
    if update_data:
        await db.meetings.update_one(
            {"_id": ObjectId(meeting_id)},
            {"$set": update_data}
        )
        
    updated_meeting = await db.meetings.find_one({"_id": ObjectId(meeting_id)})
    return updated_meeting