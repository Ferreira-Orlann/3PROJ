import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/auth.service";

type User = {
  uuid: string;
};

type Session = {
  token: string;
  owner: {
    uuid: string;
  };
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  session: Session | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (user: User, token: string) => {
    localStorage.setItem("xxxx", JSON.stringify({ uuid: user.uuid, token }));
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("xxxx");
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    const stockageSession = authService.getSession();
    if (stockageSession != null) {
      setUser({ uuid: stockageSession.uuid });
      setToken(stockageSession.token);
    }
  }, []);

  const session: Session | null =
    user && token
      ? {
          token,
          owner: { uuid: user.uuid },
        }
      : null;

  return (
    <AuthContext.Provider value={{ user, token, session, login, logout }}>
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
