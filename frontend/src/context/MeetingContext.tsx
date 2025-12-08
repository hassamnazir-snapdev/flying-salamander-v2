"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Meeting, ActionItem } from "@/types/meeting";
import { startOfDay, setHours, setMinutes, subDays, addDays, isSameDay } from "date-fns";
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

// Helper to simulate AI extraction of action items
const simulateAIExtraction = (meetingId: string, summaryText: string, meetingDate: Date): ActionItem[] => {
  const extractedActions: ActionItem[] = [];
  const now = new Date();

  // Simple keyword-based extraction for demonstration
  if (summaryText.includes("follow up with John")) {
    extractedActions.push({
      id: uuidv4(),
      meetingId,
      description: "Follow up with John regarding project status.",
      proposedActionType: "Send Email",
      status: "Pending",
      owner: "Sarah",
      createdAt: now,
      dueDate: addDays(meetingDate, 1), // Due day after meeting
    });
  }
  if (summaryText.includes("schedule next review")) {
    extractedActions.push({
      id: uuidv4(),
      meetingId,
      description: "Schedule next product review meeting.",
      proposedActionType: "Create Calendar Invite",
      status: "Pending",
      owner: "Sarah",
      dueDate: setHours(setMinutes(startOfDay(addDays(meetingDate, 2)), 0), 10), // 2 days after at 10 AM
      createdAt: now,
    });
  }
  if (summaryText.includes("assign task to Mark")) {
    extractedActions.push({
      id: uuidv4(),
      meetingId,
      description: "Assign task to Mark for Q3 planning.",
      proposedActionType: "Assign Task",
      status: "Pending",
      owner: "Mark",
      createdAt: now,
      dueDate: addDays(meetingDate, 3), // Due 3 days after meeting
    });
  }
  if (summaryText.includes("notes on strategy")) {
    extractedActions.push({
      id: uuidv4(),
      meetingId,
      description: "Add notes on Q3 strategy discussion.",
      proposedActionType: "Add Notes",
      status: "Pending",
      owner: "Sarah",
      createdAt: now,
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
        status: i === 0 ? "processed" : "processed", // Today's standup processed, past ones too
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
        const simulatedActions = simulateAIExtraction(meeting.id, `Summary for ${meeting.title}: follow up with John, schedule next review.`, meeting.date);
        simulatedActions.forEach(action => {
          initialActionItems.push({
            ...action,
            status: "Executed", // Past actions are mostly executed
            executedAt: addDays(action.createdAt, 1),
          });
        });
      } else if (meeting.id === "m-0-1") { // Specific action for today's processed meeting
        initialActionItems.push(
          {
            id: uuidv4(),
            meetingId: "m-0-1",
            description: "Review Q2 performance report.",
            proposedActionType: "Add Notes",
            status: "Confirmed",
            owner: "Sarah",
            createdAt: now,
            executedAt: now,
          },
          {
            id: uuidv4(),
            meetingId: "m-0-1",
            description: "Send follow-up email to marketing team.",
            proposedActionType: "Send Email",
            status: "Pending", // Still pending execution
            owner: "Sarah",
            createdAt: now,
          },
        );
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