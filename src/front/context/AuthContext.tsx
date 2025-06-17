// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/auth.service";
import { Session, User } from "../types/auth";

type AuthContextType = {
  user: User | null;
  token: string | null;
  session: Session | null;
  login: (session: Session) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);

  const login = (session: Session) => {
    setSession(session);
    localStorage.setItem("xxxx", JSON.stringify(session));
  };

  const logout = () => {
    authService.clearSession();
    setSession(null);
  };

  useEffect(() => {
    const existing = authService.getSession();
    if (existing) {
      setSession(existing);
    }
  }, []);

  const user = session
    ? {
        uuid: session.owner,
        username: "", // si tu veux le charger depuis l'API plus tard
        email: "",
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token: session?.token || null,
        session,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export { useAuth as useAuthContext };
