"use client";

import React from "react";
import { Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom"; // Import Link

const Header = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Daily Action Hub</h1>
      <div className="flex items-center gap-2">
        {isLoggedIn && (
          <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}>
            <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Button>
        )}
        <Button variant="ghost" size="icon" aria-label="Settings" asChild>
          <Link to="/settings"> {/* Link to the settings page */}
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </Link>
        </Button>
      </div>
    </header>
  );
};

export default Header;