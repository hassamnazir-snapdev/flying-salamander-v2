"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetings } from "@/context/MeetingContext"; // Import useMeetings
import { Badge } from "@/components/ui/badge"; // Import Badge component

const TodayDashboard = () => {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");
  const { meetings } = useMeetings(); // Use the meetings from context

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
                  <div key={meeting.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <div>
                      <h3 className="font-semibold text-lg">{meeting.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {format(meeting.startTime, "HH:mm")} - {format(meeting.endTime, "HH:mm")}
                      </p>
                    </div>
                    <Badge variant={meeting.isOnline ? "default" : "secondary"}>
                      {meeting.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">All caught up! No pending actions.</p>
            {/* Future: List of pending action items */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TodayDashboard;