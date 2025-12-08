"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Meeting } from "@/types/meeting";
import { addDays, startOfDay, setHours, setMinutes } from "date-fns";

interface MeetingContextType {
  meetings: Meeting[];
  // In a real app, you'd have functions to update meetings, add action items, etc.
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

// Helper to simulate meeting classification
const classifyMeeting = (title: string, location?: string): boolean => {
  const onlineKeywords = ["zoom.us", "meet.google.com", "teams.microsoft.com", "online meeting", "video call"];
  const lowerCaseTitle = title.toLowerCase();
  const lowerCaseLocation = location?.toLowerCase() || "";

  return onlineKeywords.some(keyword => lowerCaseTitle.includes(keyword) || lowerCaseLocation.includes(keyword));
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
      summaryLink: "https://granola.com/summary/m1", // Simulating a retrieved summary
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

  useEffect(() => {
    // Simulate daily sync of Google Calendar
    const fetchedMeetings = generateMockMeetings();
    setMeetings(fetchedMeetings);
  }, []);

  return (
    <MeetingContext.Provider value={{ meetings }}>
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