"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetings } from "@/context/MeetingContext";
import MeetingCard from "./MeetingCard";
import ActionItemCard from "./ActionItemCard"; // To display pending actions in their own card

const TodayDashboard = () => {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");
  const { meetings, actionItems } = useMeetings();

  const pendingActionItems = actionItems.filter(
    (item) => item.status === "Pending" && !meetings.some(m => m.id === item.meetingId && (m.status === 'unrecorded' || m.status === 'offline-pending-input'))
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">
        Daily Dashboard <span className="text-gray-500 dark:text-gray-400 text-xl font-normal">{formattedDate}</span>
      </h2>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No meetings scheduled for today. Enjoy the quiet!</p>
            ) : (
              <div className="space-y-4">
                {meetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    relatedActionItems={actionItems.filter(
                      (ai) => ai.meetingId === meeting.id && ai.status !== "Rejected"
                    )}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingActionItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">All caught up! No pending actions.</p>
            ) : (
              <div className="space-y-4">
                {pendingActionItems.map((actionItem) => (
                  <ActionItemCard key={actionItem.id} actionItem={actionItem} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodayDashboard;