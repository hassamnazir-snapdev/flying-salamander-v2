"use client";

import React from "react";
import { format, isSameDay, subDays, startOfDay } from "date-fns";
import { useMeetings } from "@/context/MeetingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

const PastDashboards = () => {
  const { meetings, actionItems } = useMeetings();
  const today = startOfDay(new Date());

  // Group meetings and action items by day for the past 7 days (excluding today)
  const pastDaysData: {
    date: Date;
    meetings: number;
    actionsTotal: number;
    actionsCompleted: number;
    actionsPending: number;
  }[] = [];

  for (let i = 1; i <= 6; i++) { // Past 6 days (excluding today)
    const day = subDays(today, i);
    const dayMeetings = meetings.filter(m => isSameDay(m.date, day));
    const dayActionItems = actionItems.filter(ai =>
      dayMeetings.some(m => m.id === ai.meetingId) || // Actions directly linked to a meeting on this day
      (ai.createdAt && isSameDay(ai.createdAt, day) && !ai.meetingId) // Actions created on this day but not linked to a specific meeting
    );

    const actionsCompleted = dayActionItems.filter(ai => ai.status === "Executed" || ai.status === "Confirmed").length;
    const actionsPending = dayActionItems.filter(ai => ai.status === "Pending").length;

    if (dayMeetings.length > 0 || dayActionItems.length > 0) {
      pastDaysData.push({
        date: day,
        meetings: dayMeetings.length,
        actionsTotal: dayActionItems.length,
        actionsCompleted,
        actionsPending,
      });
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-50">Past Dashboards</h2>
      {pastDaysData.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No past meeting data available.</p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {pastDaysData.map((dayData) => (
            <AccordionItem key={dayData.date.toISOString()} value={dayData.date.toISOString()}>
              <AccordionTrigger className="flex justify-between items-center py-3 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
                <span className="font-medium text-lg">{format(dayData.date, "MMM d, yyyy")}</span>
                <div className="flex items-center gap-2">
                  {dayData.actionsPending > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {dayData.actionsPending} Pending
                    </Badge>
                  )}
                  {dayData.actionsCompleted > 0 && (
                    <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-3 w-3" /> {dayData.actionsCompleted} Done
                    </Badge>
                  )}
                  {dayData.actionsTotal === 0 && dayData.meetings > 0 && (
                    <Badge variant="secondary">No Actions</Badge>
                  )}
                  {dayData.meetings === 0 && dayData.actionsTotal === 0 && (
                    <Badge variant="secondary">No Activity</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Meetings: {dayData.meetings}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Total Actions: {dayData.actionsTotal}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Completed: {dayData.actionsCompleted}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Pending: {dayData.actionsPending}
                </p>
                {/* In a full implementation, a "View Full Day" button could link to a detailed daily dashboard page */}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default PastDashboards;