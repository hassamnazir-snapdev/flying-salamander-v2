"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

interface IntegrationStatus {
  googleCalendar: boolean;
  gmail: boolean;
  granola: boolean;
  notion: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (code: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => void; // Add deleteAccount to context type
  integrationStatus: IntegrationStatus;
  toggleIntegration: (integration: keyof IntegrationStatus) => void;
  userEmail: string; // Add userEmail to context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true";
    }
    return false;
  });
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>(() => {
    if (typeof window !== "undefined") {
      const storedStatus = localStorage.getItem("integrationStatus");
      return storedStatus ? JSON.parse(storedStatus) : {
        googleCalendar: true, // Assume connected by default for mock
        gmail: true,
        granola: true,
        notion: false, // Notion is optional, start disconnected
      };
    }
    return {
      googleCalendar: true,
      gmail: true,
      granola: true,
      notion: false,
    };
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("userEmail") || "sarah@example.com"; // Mock email
    }
    return "sarah@example.com";
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("isLoggedIn", String(isLoggedIn));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("integrationStatus", JSON.stringify(integrationStatus));
    }
  }, [integrationStatus]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userEmail", userEmail);
    }
  }, [userEmail]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem("token", access_token);
      setIsLoggedIn(true);
      setUserEmail(email);
      navigate("/"); // Redirect to home after login
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const googleLogin = async (code: string) => {
    try {
      const response = await api.post("/auth/google", { code });
      const { access_token } = response.data;
      
      localStorage.setItem("token", access_token);
      setIsLoggedIn(true);
      // We'll extract email from token or another "me" endpoint later if needed
      // For now, we can set a placeholder or decode the JWT if we had the lib
      setUserEmail("Google User");
      navigate("/");
    } catch (error) {
      console.error("Google Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    // Optionally reset integration status on logout
    setIntegrationStatus({
      googleCalendar: false,
      gmail: false,
      granola: false,
      notion: false,
    });
    // Do not clear userEmail on logout, only on account deletion
    navigate("/login"); // Redirect to login after logout
  };

  const deleteAccount = () => {
    // Clear all relevant local storage data
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("integrationStatus");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("lastDailyBriefDate"); // Clear daily brief date as well
    localStorage.removeItem("token");

    setIsLoggedIn(false);
    setIntegrationStatus({
      googleCalendar: false,
      gmail: false,
      granola: false,
      notion: false,
    });
    setUserEmail(""); // Clear user email
    navigate("/login"); // Redirect to login after account deletion
  };

  const toggleIntegration = (integration: keyof IntegrationStatus) => {
    setIntegrationStatus((prev) => ({
      ...prev,
      [integration]: !prev[integration],
    }));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, googleLogin, logout, deleteAccount, integrationStatus, toggleIntegration, userEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};