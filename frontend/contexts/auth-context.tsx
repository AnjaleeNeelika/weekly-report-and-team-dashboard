"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthUser {
  id?: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>({
    email: "admin@teamsync.com",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("auth_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to load auth user from storage", e);
    }
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("access_token");
    } catch (e) {
      console.error("Error clearing storage on logout", e);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
    if (newUser) {
      try {
        localStorage.setItem("auth_user", JSON.stringify(newUser));
      } catch (e) {
        console.error("Error saving user to storage", e);
      }
    } else {
      localStorage.removeItem("auth_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: {
        email: "admin@teamsync.com",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
      },
      isLoading: false,
      signOut: async () => {},
      setUser: () => {},
    };
  }
  return context;
}
