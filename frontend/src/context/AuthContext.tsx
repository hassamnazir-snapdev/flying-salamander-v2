"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface IntegrationStatus {
  googleCalendar: boolean;
  gmail: boolean;
  granola: boolean;
  notion: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  integrationStatus: IntegrationStatus;
  toggleIntegration: (integration: keyof IntegrationStatus) => void;
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

  const login = () => {
    setIsLoggedIn(true);
    navigate("/"); // Redirect to home after login
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
    navigate("/login"); // Redirect to login after logout
  };

  const toggleIntegration = (integration: keyof IntegrationStatus) => {
    setIntegrationStatus((prev) => ({
      ...prev,
      [integration]: !prev[integration],
    }));
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, integrationStatus, toggleIntegration }}>
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