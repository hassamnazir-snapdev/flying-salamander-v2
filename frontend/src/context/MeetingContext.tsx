"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Meeting, ActionItem } from "@/types/meeting";
import { startOfDay, setHours, setMinutes } from "date-fns";
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
const simulateAIExtraction = (meetingId: string, summaryText: string): ActionItem[] => {
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
      dueDate: setHours(setMinutes(startOfDay(new Date()), 0), 10), // Tomorrow at 10 AM
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
  const today = startOfDay(new Date());

  return [
    {
      id: "m1",
      googleEventId: "gcal-m1",
      title: "Daily Standup",
      startTime: setMinutes(setHours(today, 9), 0),
      endTime: setMinutes(setHours(today, 9), 30),
      isOnline: classifyMeeting("Daily Standup", "Zoom Link: zoom.us/j/12345"),
      location: "Zoom Link: zoom.us/j/12345",
      participants: ["sarah@example.com", "john@example.com"],
      summaryLink: "https://granola.com/summary/m1",
      isRecorded: true,
      status: "processed", // Already processed for action items
    },
    {
      id: "m2",
      googleEventId: "gcal-m2",
      title: "Client Pitch - Project Alpha",
      startTime: setMinutes(setHours(today, 11), 0),
      endTime: setMinutes(setHours(today, 12), 0),
      isOnline: classifyMeeting("Client Pitch - Project Alpha", "Google Meet: meet.google.com/abc-defg-hij"),
      location: "Google Meet: meet.google.com/abc-defg-hij",
      participants: ["sarah@example.com", "client@example.com"],
      summaryLink: undefined, // Simulating no summary found (will be "unrecorded")
      isRecorded: false,
      status: "unrecorded", // Will prompt for manual input
    },
    {
      id: "m3",
      googleEventId: "gcal-m3",
      title: "Team Brainstorm Session",
      startTime: setMinutes(setHours(today, 14), 0),
      endTime: setMinutes(setHours(today, 15), 30),
      isOnline: classifyMeeting("Team Brainstorm Session", "Conference Room 3B"),
      location: "Conference Room 3B",
      participants: ["sarah@example.com", "mark@example.com", "lisa@example.com"],
      summaryLink: undefined,
      isRecorded: false,
      status: "offline-pending-input", // Will prompt for manual input
    },
    {
      id: "m4",
      googleEventId: "gcal-m4",
      title: "1:1 with John",
      startTime: setMinutes(setHours(today, 16), 0),
      endTime: setMinutes(setHours(today, 16), 30),
      isOnline: classifyMeeting("1:1 with John", "Zoom Link: zoom.us/j/67890"),
      location: "Zoom Link: zoom.us/j/67890",
      participants: ["sarah@example.com", "john@example.com"],
      summaryLink: "https://notion.so/summary/m4", // Simulating a retrieved summary
      isRecorded: true,
      status: "pending", // Ready for action item extraction
    },
    {
      id: "m5",
      googleEventId: "gcal-m5",
      title: "Product Review",
      startTime: setMinutes(setHours(today, 10), 0),
      endTime: setMinutes(setHours(today, 10), 45),
      isOnline: classifyMeeting("Product Review", "Physical Office - Main Hall"),
      location: "Physical Office - Main Hall",
      participants: ["sarah@example.com", "team@example.com"],
      summaryLink: undefined,
      isRecorded: false,
      status: "offline-pending-input",
    },
  ];
};

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    // Simulate daily sync of Google Calendar
    const fetchedMeetings = generateMockMeetings();
    setMeetings(fetchedMeetings);

    // Simulate initial action items for m1 (already processed)
    const initialActionItems: ActionItem[] = [
      {
        id: uuidv4(),
        meetingId: "m1",
        description: "Review Q2 performance report.",
        proposedActionType: "Add Notes",
        status: "Confirmed",
        owner: "Sarah",
        createdAt: new Date(),
        executedAt: new Date(),
      },
      {
        id: uuidv4(),
        meetingId: "m1",
        description: "Send follow-up email to marketing team.",
        proposedActionType: "Send Email",
        status: "Pending", // Still pending execution
        owner: "Sarah",
        createdAt: new Date(),
      },
    ];
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
    const newActionItems = simulateAIExtraction(meetingId, summaryText);
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