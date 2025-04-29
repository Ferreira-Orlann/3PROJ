import apiClient from "../client";
import { UUID } from "crypto";

/**
 * Interface pour les données de connexion
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Interface pour les données d'inscription
 */
export interface RegisterData {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

/**
 * Interface pour la réponse d'authentification
 */
export interface AuthResponse {
    token: string;
    user?: {
        uuid: UUID;
        email: string;
        username: string;
        firstname: string;
        lastname: string;
    };
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    mdp?: string;
    address?: string;
    status?: string;
    uuid?: UUID;
}

/**
 * Service d'authentification
 */
const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            console.log("Tentative de connexion avec email:", email);
            const response = await apiClient.post<AuthResponse>("/auth/login", {
                email,
                password,
            });
            console.log("Réponse de connexion réussie:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Erreur lors de la connexion:", error.message);
            if (error.response) {
                console.error("Détails de l'erreur:", error.response.data);
                console.error("Statut HTTP:", error.response.status);
            } else if (error.request) {
                console.error("Aucune réponse reçue du serveur");
                console.error("Détails de la requête:", error.request);
            }
            throw error;
        }
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
        try {
            console.log("Tentative d'inscription avec les données:", userData);
            const response = await apiClient.post<AuthResponse>(
                "/users",
                userData,
            );
            console.log("Réponse d'inscription réussie:", response.data);
            return response.data;
        } catch (error: any) {
            console.error("Erreur lors de l'inscription:", error.message);
            if (error.response) {
                console.error("Détails de l'erreur:", error.response.data);
                console.error("Statut HTTP:", error.response.status);
            } else if (error.request) {
                console.error("Aucune réponse reçue du serveur");
                console.error("Détails de la requête:", error.request);
            }
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            console.log("Tentative de déconnexion");
            await apiClient.post("/auth/logout");
            console.log("Déconnexion réussie");
        } catch (error: any) {
            console.error("Erreur lors de la déconnexion:", error.message);
            if (error.response) {
                console.error("Détails de l'erreur:", error.response.data);
            }
            throw error;
        }
    },

    checkAuth: async (): Promise<AuthResponse> => {
        try {
            console.log("Vérification de l'authentification");
            const response = await apiClient.get<AuthResponse>("/auth/me");
            console.log(
                "Vérification d'authentification réussie:",
                response.data,
            );
            return response.data;
        } catch (error: any) {
            console.error(
                "Erreur lors de la vérification d'authentification:",
                error.message,
            );
            if (error.response) {
                console.error("Détails de l'erreur:", error.response.data);
            } else if (error.request) {
                console.error("Aucune réponse reçue du serveur");
            }
            throw error;
        }
    },
};

export default authService;
