"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Meeting, ActionItem } from "@/types/meeting";
import { startOfDay, setHours, setMinutes, subDays, addDays, isSameDay, parseISO } from "date-fns";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface MeetingContextType {
  meetings: Meeting[];
  actionItems: ActionItem[];
  addOrUpdateActionItem: (actionItem: ActionItem) => void;
  updateMeetingStatus: (meetingId: string, newStatus: Meeting['status']) => void;
  processMeetingSummary: (meetingId: string, summaryText: string) => void;
  rejectActionItem: (actionItemId: string) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

// Helper to simulate meeting classification
const classifyMeeting = (title: string, location?: string): boolean => {
  const onlineKeywords = ["zoom.us", "meet.google.com", "teams.microsoft.com", "online meeting", "video call"];
  const lowerCaseTitle = title.toLowerCase();
  const lowerCaseLocation = location?.toLowerCase() || "";

  return onlineKeywords.some(keyword => lowerCaseTitle.includes(keyword) || lowerCaseLocation.includes(keyword));
};

// Mock summary content map for more dynamic retrieval
const mockSummaryContentMap: { [key: string]: string } = {
  "https://granola.com/summary/m-0-1": "Summary for Daily Standup: Discussed project milestones. Action: John to send report by tomorrow. Next Step: Schedule next review meeting for next week. Also, assign task to Mark for Q3 planning. Add notes on strategy.",
  "https://granola.com/summary/m-1-1": "Summary for Daily Standup: Reviewed sprint progress. Action: Sarah to update Jira by EOD. Next Step: Follow up with Lisa on design assets.",
  "https://granola.com/summary/m-2-1": "Summary for Daily Standup: Discussed blockers. Action: Mark to investigate API issue. Due: 2024-12-15.",
  "https://notion.so/summary/m-0-4": "Summary for 1:1 with John: Discussed career growth. Action: Sarah to provide feedback on John's performance review draft. Due: Friday. Also, John to research new tools.",
  "https://notion.so/summary/m-1-4": "Summary for 1:1 with John: Reviewed Q1 goals. Action: John to prepare Q2 objectives. Due: 2024-12-20.",
  "https://notion.so/summary/m-2-4": "Summary for 1:1 with John: Discussed team dynamics. Action: Sarah to schedule team building event. Due: next month.",
};

// Helper to simulate AI extraction of action items
const simulateAIExtraction = (meetingId: string, summaryText: string, meetingDate: Date): ActionItem[] => {
  const extractedActions: ActionItem[] = [];
  const now = new Date();

  // Regex patterns for extraction
  const actionRegex = /(?:Action|Next Step):\s*(.*?)(?:\.\s*Due:\s*(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2})|\.\s*by\s*(\w+)|$)/gi;
  const ownerRegex = /(?:to|assigned to)\s*(\w+)/i;
  const dueDateRegex = /(?:by|due):\s*(\d{4}-\d{2}-\d{2}|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next\s+\w+|next\s+week|eod)/i;

  let match;
  while ((match = actionRegex.exec(summaryText)) !== null) {
    const description = match[1].trim();
    let owner: string | undefined;
    let dueDate: Date | undefined;

    // Try to find owner within the description
    const ownerMatch = description.match(ownerRegex);
    if (ownerMatch && ownerMatch[1]) {
      owner = ownerMatch[1];
    }

    // Try to find due date within the description or from the main regex match
    const dateString = match[2] || match[3] || description.match(dueDateRegex)?.[1];
    if (dateString) {
      const lowerDateString = dateString.toLowerCase();
      if (lowerDateString === "tomorrow") {
        dueDate = addDays(startOfDay(meetingDate), 1);
      } else if (lowerDateString === "today") {
        dueDate = startOfDay(meetingDate);
      } else if (lowerDateString === "eod") {
        dueDate = setHours(setMinutes(startOfDay(meetingDate), 0), 17); // End of day 5 PM
      } else if (lowerDateString.includes("next week")) {
        dueDate = addDays(startOfDay(meetingDate), 7);
      } else if (lowerDateString.includes("next month")) {
        dueDate = addDays(startOfDay(meetingDate), 30);
      } else if (/\d{4}-\d{2}-\d{2}/.test(lowerDateString)) {
        dueDate = parseISO(lowerDateString);
      } else {
        // Simple parsing for day names (e.g., "Friday")
        const dayMap: { [key: string]: number } = {
          "sunday": 0, "monday": 1, "tuesday": 2, "wednesday": 3, "thursday": 4, "friday": 5, "saturday": 6
        };
        const currentDay = meetingDate.getDay();
        const targetDay = dayMap[lowerDateString];
        if (targetDay !== undefined) {
          let daysToAdd = targetDay - currentDay;
          if (daysToAdd <= 0) daysToAdd += 7; // If target day is today or in the past, assume next week
          dueDate = addDays(startOfDay(meetingDate), daysToAdd);
        }
      }
    }

    let proposedActionType: ActionItem['proposedActionType'] = "Add Notes";
    if (description.toLowerCase().includes("send email") || description.toLowerCase().includes("email report")) {
      proposedActionType = "Send Email";
    } else if (description.toLowerCase().includes("schedule") || description.toLowerCase().includes("calendar")) {
      proposedActionType = "Create Calendar Invite";
    } else if (description.toLowerCase().includes("assign task") || description.toLowerCase().includes("update jira")) {
      proposedActionType = "Assign Task";
    }

    extractedActions.push({
      id: uuidv4(),
      meetingId,
      description,
      proposedActionType,
      status: "Pending",
      owner: owner || "Sarah", // Default owner if not found
      createdAt: now,
      dueDate: dueDate || addDays(startOfDay(meetingDate), 3), // Default due date if not found
    });
  }

  return extractedActions;
};

const generateMockMeetings = (): Meeting[] => {
  const mockMeetings: Meeting[] = [];
  const today = startOfDay(new Date());

  for (let i = 0; i < 7; i++) { // Generate meetings for today and past 6 days
    const currentDay = subDays(today, i);

    mockMeetings.push(
      {
        id: `m-${i}-1`,
        googleEventId: `gcal-m-${i}-1`,
        title: `Daily Standup - Day ${i}`,
        startTime: setMinutes(setHours(currentDay, 9), 0),
        endTime: setMinutes(setHours(currentDay, 9), 30),
        isOnline: classifyMeeting(`Daily Standup - Day ${i}`, "Zoom Link: zoom.us/j/12345"),
        location: "Zoom Link: zoom.us/j/12345",
        participants: ["sarah@example.com", "john@example.com"],
        summaryLink: `https://granola.com/summary/m-${i}-1`,
        isRecorded: true,
        status: i === 0 ? "pending" : "processed", // Today's standup pending, past ones processed
        date: currentDay,
      },
      {
        id: `m-${i}-2`,
        googleEventId: `gcal-m-${i}-2`,
        title: `Client Pitch - Project Alpha - Day ${i}`,
        startTime: setMinutes(setHours(currentDay, 11), 0),
        endTime: setMinutes(setHours(currentDay, 12), 0),
        isOnline: classifyMeeting(`Client Pitch - Project Alpha - Day ${i}`, "Google Meet: meet.google.com/abc-defg-hij"),
        location: "Google Meet: meet.google.com/abc-defg-hij",
        participants: ["sarah@example.com", "client@example.com"],
        summaryLink: undefined, // Simulating no summary found (will be "unrecorded")
        isRecorded: false,
        status: i === 0 ? "unrecorded" : "processed", // Today's unrecorded, past ones processed (manually)
        date: currentDay,
      },
      {
        id: `m-${i}-3`,
        googleEventId: `gcal-m-${i}-3`,
        title: `Team Brainstorm Session - Day ${i}`,
        startTime: setMinutes(setHours(currentDay, 14), 0),
        endTime: setMinutes(setHours(currentDay, 15), 30),
        isOnline: classifyMeeting(`Team Brainstorm Session - Day ${i}`, "Conference Room 3B"),
        location: "Conference Room 3B",
        participants: ["sarah@example.com", "mark@example.com", "lisa@example.com"],
        summaryLink: undefined,
        isRecorded: false,
        status: i === 0 ? "offline-pending-input" : "processed", // Today's offline-pending, past ones processed
        date: currentDay,
      },
      {
        id: `m-${i}-4`,
        googleEventId: `gcal-m-${i}-4`,
        title: `1:1 with John - Day ${i}`,
        startTime: setMinutes(setHours(currentDay, 16), 0),
        endTime: setMinutes(setHours(currentDay, 16), 30),
        isOnline: classifyMeeting(`1:1 with John - Day ${i}`, "Zoom Link: zoom.us/j/67890"),
        location: "Zoom Link: zoom.us/j/67890",
        participants: ["sarah@example.com", "john@example.com"],
        summaryLink: `https://notion.so/summary/m-${i}-4`, // Simulating a retrieved summary
        isRecorded: true,
        status: i === 0 ? "pending" : "processed", // Today's pending, past ones processed
        date: currentDay,
      },
    );
  }
  return mockMeetings;
};

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    const fetchedMeetings = generateMockMeetings();
    setMeetings(fetchedMeetings);

    const initialActionItems: ActionItem[] = [];
    const now = new Date();

    // Generate initial action items for past meetings
    fetchedMeetings.forEach(meeting => {
      if (meeting.status === 'processed' && !isSameDay(meeting.date, startOfDay(now))) {
        // Simulate some executed actions for past processed meetings
        const summaryContent = meeting.summaryLink ? mockSummaryContentMap[meeting.summaryLink] || `Generic summary for ${meeting.title}` : `Manual input for ${meeting.title}: follow up with John, schedule next review.`;
        const simulatedActions = simulateAIExtraction(meeting.id, summaryContent, meeting.date);
        simulatedActions.forEach(action => {
          initialActionItems.push({
            ...action,
            status: "Executed", // Past actions are mostly executed
            executedAt: addDays(action.createdAt, 1),
          });
        });
      }
    });

    setActionItems(initialActionItems);
  }, []);

  const addOrUpdateActionItem = (actionItem: ActionItem) => {
    setActionItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === actionItem.id);
      if (existingIndex > -1) {
        const updatedItems = [...prev];
        updatedItems[existingIndex] = { ...updatedItems[existingIndex], ...actionItem };
        return updatedItems;
      }
      return [...prev, actionItem];
    });
  };

  const updateMeetingStatus = (meetingId: string, newStatus: Meeting['status']) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m)),
    );
  };

  const processMeetingSummary = (meetingId: string, summaryText: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    const newActionItems = simulateAIExtraction(meetingId, summaryText, meeting.date);
    setActionItems((prev) => [...prev, ...newActionItems]);
    updateMeetingStatus(meetingId, 'processed');
  };

  const rejectActionItem = (actionItemId: string) => {
    setActionItems((prev) => prev.filter(item => item.id !== actionItemId));
  };

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        actionItems,
        addOrUpdateActionItem,
        updateMeetingStatus,
        processMeetingSummary,
        rejectActionItem,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error("useMeetings must be used within a MeetingProvider");
  }
  return context;
};