"use client";

import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TodayDashboard = () => {
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d, yyyy");

  return (
    <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-50">
        Daily Dashboard <span className="text-gray-500 dark:text-gray-400 text-xl font-normal">{formattedDate}</span>
      </h2>

      <div className="grid gap-6">
        {/* Placeholder for Today's Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">No meetings scheduled for today. Enjoy the quiet!</p>
            {/* Future: List of meetings, summaries, and action items */}
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