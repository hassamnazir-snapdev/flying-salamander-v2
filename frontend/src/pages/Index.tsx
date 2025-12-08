"use client";

import React from "react";
import Header from "@/components/Header";
import TodayDashboard from "@/components/TodayDashboard";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex flex-1">
        {/* Today's Dashboard (Left side, takes full width on small screens) */}
        <div className="flex-1">
          <TodayDashboard />
        </div>
        {/* Future: Past Dashboards (Right side, hidden for MVP as per PRD) */}
        {/* <div className="hidden lg:block w-1/3 border-l border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-950 p-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-50">Past Dashboards</h2>
          <p className="text-gray-500 dark:text-gray-400">This section will show past dashboards (MVP excluded).</p>
        </div> */}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Index;