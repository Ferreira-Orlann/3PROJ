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

    // Check for existing session on app start
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
                // Configurer le client API avec le token
                apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
                
                // Mettre à jour l'état
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                
                // Ne pas rediriger automatiquement si l'utilisateur est déjà sur une page protégée
                const currentPath = window.location.pathname;
                if (currentPath === "/" || currentPath.includes("/auth/")) {
                    router.replace("/screens/homeScreen");
                }
            }
        } catch (error) {
            console.error("Error restoring token:", error);
            // En cas d'erreur, effacer les données de session pour éviter des problèmes
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Simulate API call delay
    const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Utiliser directement le service d'authentification avec email/password
            console.log("Tentative de connexion avec email:", email, password);
            const authResponse = await authService.login(email, password);
            console.log("Login response:", authResponse);

            // Extraire le token de la réponse
            const { token: authToken, uuid } = authResponse;
            console.log("Token:", authToken);

            // Récupérer les informations utilisateur
            try {
                const userResponse = await apiClient.get(`/users/${email}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                const userData = userResponse.data;
                console.log("User data:", userData);

                // Récupérer le bon utilisateur qui correspond à l'email et au mot de passe
                const currentUser = Array.isArray(userData)
                    ? userData.find((user) => user.email === email)
                    : userData;

                console.log("Current user:", currentUser);

                // Créer l'objet utilisateur à partir des données
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

                // Configurer le client API avec le token
                apiClient.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
                
                // Stocker les données de session
                await AsyncStorage.setItem("userToken", authToken);
                await AsyncStorage.setItem(
                    "userData",
                    JSON.stringify(mappedUser),
                );

                // Mettre à jour l'état et rediriger
                setToken(authToken);
                setUser(mappedUser);

                router.replace("/screens/homeScreen");
            } catch (userError) {
                console.error("Error fetching user data:", userError);
                // Même en cas d'erreur, on stocke le token et on redirige
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
    // Supprimer le log de debug qui pollue la console

    const register = async (
        username: string,
        email: string,
        password: string,
    ) => {
        setIsLoading(true);
        try {
            // Préparer les données d'inscription
            const registerData = {
                username,
                email,
                password,
                firstname: username.split(" ")[0] || username, // First part of username as firstname
                lastname: username.split(" ")[1] || "User", // Second part or default
                mdp: password,
                address: "Default Address",
                status: "online",
            };
            console.log("Register data:", registerData);

            // Utiliser le service d'authentification pour l'inscription
            const userResponse = await authService.register(registerData);
            console.log("Registration response:", userResponse);

            // Après l'inscription réussie, connecter l'utilisateur
            const authResponse = await authService.login(email, password);
            console.log("Auto-login after registration:", authResponse);

            // Extraire le token et l'UUID
            const { token: authToken, uuid } = authResponse;

            // Récupérer les informations utilisateur
            try {
                const userDataResponse = await apiClient.get(`/users/${uuid}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                const userData = userDataResponse.data;
                console.log("User data after registration:", userData);

                // Récupérer le bon utilisateur qui correspond à l'email
                const currentUser = Array.isArray(userData)
                    ? userData.find((user) => user.email === email)
                    : userData;

                console.log("Current registered user:", currentUser);

                // Créer l'objet utilisateur
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

                // Stocker les données de session
                await AsyncStorage.setItem("userToken", authToken);
                await AsyncStorage.setItem(
                    "userData",
                    JSON.stringify(mappedUser),
                );

                // Mettre à jour l'état et rediriger
                setToken(authToken);
                setUser(mappedUser);
                router.replace("/screens/homeScreen");
            } catch (userError) {
                console.error(
                    "Error fetching user data after registration:",
                    userError,
                );
                // Même en cas d'erreur, on stocke le token et on redirige
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
            // Clear stored data
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userData");

            // Reset state
            setToken(null);
            setUser(null);

            // Navigate to login screen
            router.replace("../auth/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Context value
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

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Default export
export default AuthProvider;
