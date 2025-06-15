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

const REACTIONS_CONFIG = {
    timeout: 8000,  
    validateStatus: (status: number) => status < 500, 
    retries: 2,     
    initialDelay: 1000, 
};

async function retryRequest<T>(requestFn: () => Promise<T>, maxRetries = REACTIONS_CONFIG.retries, delay = REACTIONS_CONFIG.initialDelay): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;
            
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.code !== 'ECONNABORTED' && !axiosError.message.includes('timeout') && axiosError.response) {
                    throw error;
                }
            }
            
            if (attempt < maxRetries - 1) {
                console.log(`Tentative ${attempt + 1}/${maxRetries} échouée, nouvelle tentative dans ${delay}ms...`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            
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
