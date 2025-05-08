import React, { createContext, useContext, useEffect, useState } from "react";
import { Session } from "../types/auth";

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

    return (
        <AuthContext.Provider value={{user, session, setUser, setSession}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};
