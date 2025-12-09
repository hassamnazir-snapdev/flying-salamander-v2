"use client";

import React from "react";
import { Settings, LogOut, RefreshCw, Calendar, Database } from "lucide-react"; // Import icons
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useMeetings } from "@/context/MeetingContext"; // Import useMeetings
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { isLoggedIn, logout } = useAuth();
  const { syncMeetings } = useMeetings(); // Use syncMeetings from context

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Daily Action Hub</h1>
      <div className="flex items-center gap-2">
        {isLoggedIn && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Sync Options">
                  <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => syncMeetings("mock")}>
                  <Database className="mr-2 h-4 w-4" />
                  Load Mock Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => syncMeetings("google")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Sync Google Calendar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}>
              <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" aria-label="Settings" asChild>
          <Link to="/settings">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;