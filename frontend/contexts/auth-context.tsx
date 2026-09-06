"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/data/auth/data";

export interface AuthUser {
  id?: number;
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
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then((currentUser) => {
        setUser({
          id: currentUser.user_id,
          email: currentUser.email,
          firstName: currentUser.first_name,
          lastName: currentUser.last_name,
          role: currentUser.role,
        });
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Error completing logout", e);
    } finally {
      setUser(null);
      setIsLoading(false);
      router.replace("/auth/signin");
    }
  };

  const handleSetUser = (newUser: AuthUser | null) => {
    setUser(newUser);
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
      user: null,
      isLoading: false,
      signOut: async () => {},
      setUser: () => {},
    };
  }
  return context;
}
