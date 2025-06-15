import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import authService from "../services/api/endpoints/auth";
import apiClient from "../services/api/client";
import { UUID } from "crypto";

// Types
export type User = {
    uuid: UUID;
    username: string;
    email: string;
    mdp: string;
    avatar?: string;
    status: "online" | "away" | "offline";
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (
        username: string,
        email: string,
        password: string,
    ) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkExistingSession();
    }, []);

    const checkExistingSession = async () => {
        try {
            const storedToken = await AsyncStorage.getItem("userToken");
            const storedUser = await AsyncStorage.getItem("userData");
            console.log("Stored token:", storedToken);
            console.log("Stored user:", storedUser);

            if (storedToken && storedUser) {
                apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
                
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                
          
                const currentPath = window.location.pathname;
                if (currentPath === "/" || currentPath.includes("/auth/")) {
                    router.replace("/screens/homeScreen");
                }
            }
        } catch (error) {
            console.error("Error restoring token:", error);
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            console.log("Tentative de connexion avec email:", email, password);
            const authResponse = await authService.login(email, password);
            console.log("Login response:", authResponse);
            const { token: authToken, uuid } = authResponse;
            console.log("Token:", authToken);

            try {
                const userResponse = await apiClient.get(`/users/${email}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                const userData = userResponse.data;
                console.log("User data:", userData);

                const currentUser = Array.isArray(userData)
                    ? userData.find((user) => user.email === email)
                    : userData;

                console.log("Current user:", currentUser);

                const mappedUser: User = {
                    uuid: currentUser.uuid,
                    username:
                        currentUser?.firstname && currentUser?.lastname
                            ? currentUser.firstname + " " + currentUser.lastname
                            : email.split("@")[0],
                    email: currentUser?.email || email,
                    mdp: password,
                    status:
                        (currentUser?.status as
                            | "online"
                            | "away"
                            | "offline") || "online",
                };

                apiClient.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
                
                await AsyncStorage.setItem("userToken", authToken);
                await AsyncStorage.setItem(
                    "userData",
                    JSON.stringify(mappedUser),
                );

                setToken(authToken);
                setUser(mappedUser);

                router.replace("/screens/homeScreen");
            } catch (userError) {
                console.error("Error fetching user data:", userError);
                await AsyncStorage.setItem("userToken", authToken);
                setToken(authToken);
                router.replace("/screens/homeScreen");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (
        username: string,
        email: string,
        password: string,
    ) => {
        setIsLoading(true);
        try {
            const registerData = {
                username,
                email,
                password,
                firstname: username.split(" ")[0] || username,
                lastname: username.split(" ")[1] || "User",
                mdp: password,
                address: "Default Address",
                status: "online",
            };
            console.log("Register data:", registerData);

            const userResponse = await authService.register(registerData);
            console.log("Registration response:", userResponse);

            const authResponse = await authService.login(email, password);
            console.log("Auto-login after registration:", authResponse);

            const { token: authToken, uuid } = authResponse;

            try {
                const userDataResponse = await apiClient.get(`/users/${uuid}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                const userData = userDataResponse.data;
                console.log("User data after registration:", userData);

                const currentUser = Array.isArray(userData)
                    ? userData.find((user) => user.email === email)
                    : userData;

                console.log("Current registered user:", currentUser);

                const mappedUser: User = {
                    uuid: currentUser.uuid,
                    username:
                        currentUser?.firstname && currentUser?.lastname
                            ? currentUser.firstname + " " + currentUser.lastname
                            : registerData.firstname +
                              " " +
                              registerData.lastname,
                    email: currentUser?.email || email,
                    mdp: password,
                    status:
                        (currentUser?.status as
                            | "online"
                            | "away"
                            | "offline") || "online",
                };

                await AsyncStorage.setItem("userToken", authToken);
                await AsyncStorage.setItem(
                    "userData",
                    JSON.stringify(mappedUser),
                );

                setToken(authToken);
                setUser(mappedUser);
                router.replace("/screens/homeScreen");
            } catch (userError) {
                console.error(
                    "Error fetching user data after registration:",
                    userError,
                );
                await AsyncStorage.setItem("userToken", authToken);
                setToken(authToken);
                router.replace("/screens/homeScreen");
            }
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");

            setToken(null);
            setUser(null);

            router.replace("../auth/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

        const value = {
        user,
        token,
        login,
        register,
        logout,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export default AuthProvider;
