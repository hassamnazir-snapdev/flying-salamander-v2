"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SettingsPage = () => {
  const { integrationStatus, toggleIntegration } = useAuth();

  const integrations = [
    { key: "googleCalendar", name: "Google Calendar" },
    { key: "gmail", name: "Gmail" },
    { key: "granola", name: "Granola" },
    { key: "notion", name: "Notion" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Settings</h2>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Manage your connected external services.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.key} className="flex items-center justify-between">
                <Label htmlFor={integration.key} className="text-base">
                  {integration.name}
                </Label>
                <Switch
                  id={integration.key}
                  checked={integrationStatus[integration.key as keyof typeof integrationStatus]}
                  onCheckedChange={() => toggleIntegration(integration.key as keyof typeof integrationStatus)}
                />
              </div>
            ))}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Note: These integrations are mocked for demonstration purposes.
            </p>
          </CardContent>
        </Card>

        {/* Future: User Profile settings */}
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>View and manage your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Profile management features will be added here.
            </p>
            <Button variant="destructive" className="mt-4">
              Delete Account (Mock)
            </Button>
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default SettingsPage;