import apiClient from "../client";
import { UUID } from "crypto";
import axios, { AxiosError } from "axios";

export interface Reaction {
    uuid: UUID;
    emoji: string;
    user: {
        uuid: UUID;
        username: string;
    };
    message: {
        uuid: UUID;
    };
}

export interface CreateReactionData {
    emoji: string;
    user_uuid: UUID;
    message_uuid: UUID;
}

// Configuration spécifique pour les requêtes de réactions
const REACTIONS_CONFIG = {
    timeout: 8000,  // 8 secondes pour les réactions (plus court que 15s pour éviter de bloquer l'UI trop longtemps)
    validateStatus: (status: number) => status < 500, // Accepter les codes 2xx, 3xx et 4xx
    retries: 2,     // Nombre de tentatives max
    initialDelay: 1000, // Délai initial entre les tentatives
};

// Fonction utilitaire pour les tentatives de requête avec retry
async function retryRequest<T>(requestFn: () => Promise<T>, maxRetries = REACTIONS_CONFIG.retries, delay = REACTIONS_CONFIG.initialDelay): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;
            
            // Si ce n'est pas une erreur de timeout ou de réseau, ne pas réessayer
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.code !== 'ECONNABORTED' && !axiosError.message.includes('timeout') && axiosError.response) {
                    throw error;
                }
            }
            
            // Dernier essai échoué, ne pas afficher de message
            if (attempt < maxRetries - 1) {
                console.log(`Tentative ${attempt + 1}/${maxRetries} échouée, nouvelle tentative dans ${delay}ms...`);
            }
            
            // Attendre avant de réessayer
            await new Promise(resolve => setTimeout(resolve, delay));
            
            // Augmenter le délai pour la prochaine tentative (backoff exponentiel)
            delay *= 2;
        }
    }
    
    throw lastError;
}

const reactionService = {
    addReaction: async (
        workspaceUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
        data: CreateReactionData,
    ): Promise<Reaction> => {
        const response = await apiClient.post<Reaction>(
            `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
            data,
        );
        return response.data;
    },

    addDirectMessageReaction: async (
        userUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
        data: CreateReactionData,
    ): Promise<Reaction> => {
        const response = await apiClient.post<Reaction>(
            `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
            data,
        );
        return response.data;
    },

    removeReaction: async (
        workspaceUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
        reactionUuid: UUID,
    ): Promise<void> => {
        await apiClient.delete(
            `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions/${reactionUuid}`,
        );
    },

    removeDirectMessageReaction: async (
        userUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
        reactionUuid: UUID,
    ): Promise<void> => {
        await apiClient.delete(
            `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions/${reactionUuid}`,
        );
    },

    getReactions: async (
        workspaceUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
    ): Promise<Reaction[]> => {
        try {
            // Utiliser retryRequest avec la configuration spécifique pour les réactions
            return await retryRequest(async () => {
                const response = await apiClient.get<Reaction[]>(
                    `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
                    { 
                        timeout: REACTIONS_CONFIG.timeout,
                        validateStatus: REACTIONS_CONFIG.validateStatus
                    }
                );
                return response.data || [];
            });
        } catch (error) {
            // Utiliser console.warn au lieu de console.error pour éviter de polluer les logs
            console.warn(`Impossible de charger les réactions pour le message ${messageUuid}:`, 
                error instanceof Error ? error.message : 'Erreur inconnue');
            // Retourner un tableau vide en cas d'échec pour éviter de bloquer l'interface
            return [];
        }
    },

    getDirectMessageReactions: async (
        userUuid: UUID,
        channelUuid: UUID,
        messageUuid: UUID,
    ): Promise<Reaction[]> => {
        try {
            // Utiliser retryRequest avec la configuration spécifique pour les réactions
            return await retryRequest(async () => {
                const response = await apiClient.get<Reaction[]>(
                    `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
                    { 
                        timeout: REACTIONS_CONFIG.timeout,
                        validateStatus: REACTIONS_CONFIG.validateStatus
                    }
                );
                return response.data || [];
            });
        } catch (error) {
            // Utiliser console.warn au lieu de console.error pour éviter de polluer les logs
            console.warn(`Impossible de charger les réactions pour le message privé ${messageUuid}:`, 
                error instanceof Error ? error.message : 'Erreur inconnue');
            // Retourner un tableau vide en cas d'échec pour éviter de bloquer l'interface
            return [];
        }
    },
};

export default reactionService;
