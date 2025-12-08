"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useMeetings } from "@/context/MeetingContext";
import { format, isSameDay, startOfDay } from "date-fns";
import { useAuth } from "@/context/AuthContext";

export const useDailyBrief = () => {
  const { actionItems } = useMeetings();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) return;

    const today = startOfDay(new Date());
    const lastBriefDateString = localStorage.getItem("lastDailyBriefDate");
    let lastBriefDate: Date | null = null;

    if (lastBriefDateString) {
      lastBriefDate = new Date(lastBriefDateString);
    }

    // Show brief if it's a new day or if it's the first time loading today
    if (!lastBriefDate || !isSameDay(lastBriefDate, today)) {
      const pendingActionsToday = actionItems.filter(
        (item) => item.status === "Pending" && isSameDay(item.createdAt, today)
      );

      let briefMessage = `Good morning! You have ${pendingActionsToday.length} pending action item(s) for today.`;

      if (pendingActionsToday.length > 0) {
        briefMessage += " Let's get them done!";
      } else {
        briefMessage += " You're all caught up!";
      }

      toast.info("Daily Brief", {
        description: briefMessage,
        duration: 8000, // Show for 8 seconds
      });

      localStorage.setItem("lastDailyBriefDate", today.toISOString());
    }
  }, [isLoggedIn, actionItems]); // Re-run if login status or action items change
};