from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Optional
from datetime import datetime
import re
from bson import ObjectId

from backend.database import db
from backend.models.action_item import ActionItem, ActionItemCreate, ActionItemUpdate, ActionType, ActionStatus
from backend.models.user import UserResponse
from backend.auth.security import get_current_user

router = APIRouter(
    prefix="/action-items",
    tags=["action-items"]
)

# --- Helper Functions ---

def extract_action_items_from_text(text: str) -> List[dict]:
    """
    Heuristic-based extraction of action items from text.
    Looks for patterns like "Action:", "Task:", "Email:", etc.
    """
    items = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        description = None
        action_type = ActionType.TASK
        
        # patterns
        action_match = re.match(r"^(?:Action|Task|TODO|Next Step):\s*(.*)", line, re.IGNORECASE)
        email_match = re.match(r"^(?:Email|Contact):\s*(.*)", line, re.IGNORECASE)
        invite_match = re.match(r"^(?:Invite|Schedule):\s*(.*)", line, re.IGNORECASE)
        
        if email_match:
            description = line # Keep full context for email
            action_type = ActionType.EMAIL
        elif invite_match:
            description = line
            action_type = ActionType.INVITE
        elif action_match:
            description = action_match.group(1).strip()
            action_type = ActionType.TASK
        
        if description:
            # Simple due date extraction (heuristic)
            # Looks for "due by Friday", "due: 2023-01-01" etc at the end of string
            # We won't try to parse natural language dates into datetime objects in this regex pass
            # as that requires more complex NLP libraries not present (like dateparser).
            # We will just extract the item.
            
            items.append({
                "description": description,
                "action_type": action_type,
                "status": ActionStatus.PENDING
            })

    return items

# --- Routes ---

@router.post("/meetings/{meeting_id}/process", response_model=List[ActionItem])
async def process_meeting_actions(
    meeting_id: str, 
    summary_text: str = Body(..., embed=True), 
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Extract action items from meeting summary text.
    """
    # Verify meeting exists and belongs to user (or is accessible)
    # Note: user_id in meeting is ObjectId, current_user.id is str
    meeting = await db.meetings.find_one({"_id": ObjectId(meeting_id), "user_id": ObjectId(current_user.id)})
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    extracted_data = extract_action_items_from_text(summary_text)
    
    created_items = []
    for item_data in extracted_data:
        new_item = ActionItem(
            **item_data,
            user_id=current_user.id,
            meeting_id=meeting_id
        )
        result = await db.action_items.insert_one(new_item.model_dump(by_alias=True, exclude=["id"]))
        created_item = await db.action_items.find_one({"_id": result.inserted_id})
        created_items.append(created_item)
        
    return created_items

@router.get("/", response_model=List[ActionItem])
async def get_action_items(
    current_user: UserResponse = Depends(get_current_user),
    status: Optional[ActionStatus] = None
):
    query = {"user_id": current_user.id}
    if status:
        query["status"] = status
    else:
        # Default to showing pending items if not specified? 
        # Or showing all? PRD says "Get all pending action items" in the goals list usually, 
        # but standard GET often returns all. 
        # The prompt says: "GET /action-items: Get all pending action items for the current user."
        # So let's default to Pending if not specified, or explicitly filter in the frontend.
        # Let's filter for non-completed/executed by default if deemed "pending", 
        # OR just return everything and let frontend filter.
        # Given "Get all pending action items" instruction:
        query["status"] = ActionStatus.PENDING

    items = await db.action_items.find(query).to_list(100)
    return items

@router.post("/", response_model=ActionItem)
async def create_action_item(
    item: ActionItemCreate, 
    current_user: UserResponse = Depends(get_current_user)
):
    new_item = ActionItem(
        **item.model_dump(),
        user_id=current_user.id
    )
    result = await db.action_items.insert_one(new_item.model_dump(by_alias=True, exclude=["id"]))
    created_item = await db.action_items.find_one({"_id": result.inserted_id})
    return created_item

@router.patch("/{item_id}", response_model=ActionItem)
async def update_action_item(
    item_id: str, 
    update_data: ActionItemUpdate, 
    current_user: UserResponse = Depends(get_current_user)
):
    # Ensure item belongs to user
    item = await db.action_items.find_one({"_id": ObjectId(item_id), "user_id": current_user.id})
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    # Filter out None values
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}

    if update_dict:
        await db.action_items.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": update_dict}
        )

    updated_item = await db.action_items.find_one({"_id": ObjectId(item_id)})
    return updated_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_action_item(
    item_id: str, 
    current_user: UserResponse = Depends(get_current_user)
):
    result = await db.action_items.delete_one({"_id": ObjectId(item_id), "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Action item not found")
    return

@router.post("/{item_id}/execute")
async def execute_action_item(
    item_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Simulate execution of an action item.
    Updates the status to 'Executed'.
    """
    # Ensure item belongs to user
    item = await db.action_items.find_one({"_id": ObjectId(item_id), "user_id": current_user.id})
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    await db.action_items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": {"status": ActionStatus.EXECUTED}}
    )

    return {"status": "executed"}