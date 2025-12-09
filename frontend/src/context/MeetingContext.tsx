"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Meeting, ActionItem } from "@/types/meeting";
import { startOfDay, addDays, parseISO, setHours, setMinutes } from "date-fns";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface MeetingContextType {
  meetings: Meeting[];
  actionItems: ActionItem[];
  addOrUpdateActionItem: (actionItem: ActionItem) => void;
  updateMeetingStatus: (meetingId: string, newStatus: Meeting['status']) => void;
  processMeetingSummary: (meetingId: string, summaryText: string) => void;
  rejectActionItem: (actionItemId: string) => void;
  syncMeetings: (source?: 'mock' | 'google') => Promise<void>;
  isLoading: boolean;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

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

export const MeetingProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMeetings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/meetings/');
      const fetchedMeetings = response.data.map((m: any) => ({
        id: m._id,
        googleEventId: m.google_event_id,
        title: m.title,
        // Backend returns ISO strings, ensure new Date() parses them correctly
        startTime: new Date(m.start_time),
        endTime: new Date(m.end_time),
        isOnline: m.is_online,
        location: m.location,
        participants: m.participants || [],
        summaryLink: m.summary_link,
        isRecorded: m.is_recorded,
        status: m.status,
        // Use local start of day for grouping
        date: startOfDay(new Date(m.start_time)),
      }));
      setMeetings(fetchedMeetings);
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
      // Don't show toast on initial load if just not logged in
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to process a summary and add action items
  const processMeetingSummary = (meetingId: string, summaryText: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;

    const newActionItems = simulateAIExtraction(meetingId, summaryText, meeting.date);
    setActionItems((prev) => [...prev, ...newActionItems]);
    updateMeetingStatus(meetingId, 'processed');
  };

  // Function to update meeting status
  const updateMeetingStatus = async (meetingId: string, newStatus: Meeting['status']) => {
    // Optimistic update
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m)),
    );

    try {
        await api.patch(`/meetings/${meetingId}/status`, { status: newStatus });
    } catch (error) {
        console.error("Failed to update meeting status on backend:", error);
        toast({
            title: "Error",
            description: "Failed to update meeting status.",
            variant: "destructive",
        });
        // Revert? (Not implemented for simplicity)
    }
  };

  // Function to add or update an action item
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

  // Function to reject an action item
  const rejectActionItem = (actionItemId: string) => {
    setActionItems((prev) => prev.filter(item => item.id !== actionItemId));
  };

  // Sync meetings from backend
  const syncMeetings = async (source: 'mock' | 'google' = 'mock') => {
    setIsLoading(true);
    try {
      await api.post(`/meetings/sync?source=${source}`);
      toast({
        title: "Sync Successful",
        description: `Meetings synced from ${source === 'mock' ? 'Mock Data' : 'Google Calendar'}.`,
      });
      await fetchMeetings();
    } catch (error) {
      console.error("Sync failed:", error);
      toast({
        title: "Sync Failed",
        description: "Could not sync meetings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        fetchMeetings();
    }
  }, [fetchMeetings]);

  return (
    <MeetingContext.Provider
      value={{
        meetings,
        actionItems,
        addOrUpdateActionItem,
        updateMeetingStatus,
        processMeetingSummary,
        rejectActionItem,
        syncMeetings,
        isLoading,
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