import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "../types/auth";
import AuthPage from "../Pages/AuthPage";
import authService from "../services/auth.service";

type User = {
    uuid: string;
};

type AuthContextType = {
    user: Partial<User> | null;
    session: Session | null
    setUser: (session: Session) => void;
    setSession: (session: Session) => void;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    setUser: () => {},
    setSession: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<Partial<User> | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const stockageSession = authService.getSession()
        if (stockageSession != null) {
            setSession(stockageSession)
        }
    })
    
    return (
        <AuthContext.Provider value={{user, session, setUser, setSession}}>
            {session == null ? <AuthPage /> : children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
