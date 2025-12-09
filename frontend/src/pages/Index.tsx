"use client";

import React from "react";
import Header from "@/components/Header";
import TodayDashboard from "@/components/TodayDashboard";
import PastDashboards from "@/components/PastDashboards";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { useDailyBrief } from "@/hooks/useDailyBrief"; // Import the new hook

const Index = () => {
  useDailyBrief(); // Call the hook here

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex flex-1">
        {/* Today's Dashboard (Left side, takes full width on small screens) */}
        <div className="flex-1">
          <TodayDashboard />
        </div>
        {/* Past Dashboards (Right side, visible on larger screens) */}
        <div className="hidden lg:block w-1/3 border-l border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 p-4 overflow-y-auto">
          <PastDashboards />
        </div>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;