"use client";

import React, { useState } from "react";
import { Meeting, ActionItem } from "@/types/meeting";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useMeetings } from "@/context/MeetingContext";
import ActionItemCard from "./ActionItemCard";
import { toast } from "sonner";
import { Link } from "react-router-dom"; // For summary link

interface MeetingCardProps {
  meeting: Meeting;
  relatedActionItems: ActionItem[];
}

// Mock summary content map (should ideally be in context or fetched)
const mockSummaryContentMap: { [key: string]: string } = {
  "https://granola.com/summary/m-0-1": "Summary for Daily Standup: Discussed project milestones. Action: John to send report by tomorrow. Next Step: Schedule next review meeting for next week. Also, assign task to Mark for Q3 planning. Add notes on strategy.",
  "https://granola.com/summary/m-1-1": "Summary for Daily Standup: Reviewed sprint progress. Action: Sarah to update Jira by EOD. Next Step: Follow up with Lisa on design assets.",
  "https://granola.com/summary/m-2-1": "Summary for Daily Standup: Discussed blockers. Action: Mark to investigate API issue. Due: 2024-12-15.",
  "https://notion.so/summary/m-0-4": "Summary for 1:1 with John: Discussed career growth. Action: Sarah to provide feedback on John's performance review draft. Due: Friday. Also, John to research new tools.",
  "https://notion.so/summary/m-1-4": "Summary for 1:1 with John: Reviewed Q1 goals. Action: John to prepare Q2 objectives. Due: 2024-12-20.",
  "https://notion.so/summary/m-2-4": "Summary for 1:1 with John: Discussed team dynamics. Action: Sarah to schedule team building event. Due: next month.",
};


const MeetingCard = ({ meeting, relatedActionItems }: MeetingCardProps) => {
  const { updateMeetingStatus, processMeetingSummary } = useMeetings();
  const [manualInput, setManualInput] = useState<string>("");

  const handleProcessSummary = () => {
    if (meeting.summaryLink) {
      // Simulate fetching the summary content from the link
      const summaryContent = mockSummaryContentMap[meeting.summaryLink] || `No detailed summary found for ${meeting.title}.`;
      processMeetingSummary(meeting.id, summaryContent);
      toast.success(`Summary for "${meeting.title}" processed!`);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      processMeetingSummary(meeting.id, manualInput.trim());
      setManualInput("");
      toast.success(`Manual input for "${meeting.title}" processed!`);
    } else {
      toast.error("Please enter some text for next steps.");
    }
  };

  const getMeetingPrompt = () => {
    if (meeting.status === "unrecorded") {
      return `No recording found for "${meeting.title}". What should the next step be?`;
    }
    if (meeting.status === "offline-pending-input") {
      const participants = meeting.participants.filter(p => p !== "sarah@example.com").map(p => p.split('@')[0]).join(', ');
      return `You had an offline meeting with ${participants || 'colleagues'}. Any to-dos?`;
    }
    return "";
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{meeting.title}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={meeting.isOnline ? "default" : "secondary"}>
            {meeting.isOnline ? "Online" : "Offline"}
          </Badge>
          <Badge variant="outline">
            {format(meeting.startTime, "HH:mm")} - {format(meeting.endTime, "HH:mm")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {meeting.location && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{meeting.location}</p>
        )}

        {/* Display Summary Link if available */}
        {meeting.summaryLink && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
            Summary: <Link to={meeting.summaryLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-700">{meeting.summaryLink.split('/').pop()}</Link>
          </p>
        )}

        {/* Conditional rendering based on meeting status */}
        {meeting.status === "pending" && meeting.summaryLink && (
          <div className="mt-4">
            <Button onClick={handleProcessSummary} className="w-full">
              Process Summary & Extract Next Steps
            </Button>
          </div>
        )}

        {(meeting.status === "unrecorded" || meeting.status === "offline-pending-input") && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{getMeetingPrompt()}</p>
            <Textarea
              placeholder="Type next steps or to-dos here..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleManualSubmit} className="w-full">
              Submit Next Steps
            </Button>
          </div>
        )}

        {/* Display Action Items */}
        {relatedActionItems.length > 0 && (
          <div className="mt-4 border-t pt-4 dark:border-gray-700">
            <h4 className="font-semibold mb-2">Action Items:</h4>
            {relatedActionItems.map((actionItem) => (
              <ActionItemCard key={actionItem.id} actionItem={actionItem} />
            ))}
          </div>
        )}

        {meeting.status === "processed" && relatedActionItems.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">No action items extracted or manually added for this meeting.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingCard;