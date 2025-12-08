"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Login = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Daily Action Hub</CardTitle>
          <CardDescription>Sign in to manage your meeting follow-ups</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={login} className="w-full">
            <img src="/public/google-icon.svg" alt="Google icon" className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This is a mock login for demonstration purposes.
          </p>
        </CardContent>
      </Card>
      <MadeWithDyad />
    </div>
  );
};

export default Login;