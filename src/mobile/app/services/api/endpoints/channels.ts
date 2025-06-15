import apiClient from "../client";
import { UUID } from "crypto";

/**
 * Interface pour un canal
 */
export interface Channel {
    id: UUID;
    uuid?: UUID; // Ajouter uuid comme propriété optionnelle pour compatibilité avec le backend
    name: string;
    description: string;
    is_public: boolean;
    workspace_uuid?: UUID; // Rendre optionnel
    workspace?: UUID; // Ajouter comme alternative
    memberCount: number;
    createdAt: string;
}

/**
 * Interface pour la création d'un canal
 */
export interface CreateChannelData {
    name: string;
    description: string;
    is_public: boolean;
    workspaceId: UUID;
}

/**
 * Service pour les canaux
 */
const channelService = {
    getChannels: async (): Promise<Channel[]> => {
        const response = await apiClient.get<Channel[]>(`/channels`);
        return response.data;
    },

    getChannelById: async (channelId: UUID): Promise<Channel> => {
        const response = await apiClient.get<Channel>(`/channels/${channelId}`);
        return response.data;
    },

    createChannel: async (channelData: CreateChannelData): Promise<Channel> => {
        console.log("Création du canal avec donnéesss:", channelData);
        const response = await apiClient.post<Channel>(
            `/workspaces/${channelData.workspaceId}/channels`,
            channelData,
        );
        return response.data;
    },

    updateChannel: async (
        workspaceId: UUID,
        channelId: UUID,
        channelData: Partial<Omit<CreateChannelData, "workspaceId">>,
    ): Promise<Channel> => {
        const response = await apiClient.put<Channel>(
            `/workspaces/${workspaceId}/channels/${channelId}`,
            channelData,
        );
        return response.data;
    },

    deleteChannel: async (channelId: UUID): Promise<void> => {
        await apiClient.delete(`/channels/${channelId}`);
    },

    joinChannel: async (channelId: UUID): Promise<void> => {
        await apiClient.post(`/channels/${channelId}/join`);
    },

    leaveChannel: async (channelId: UUID): Promise<void> => {
        await apiClient.post(`/channels/${channelId}/leave`);
    },

    // Inviter un membre à rejoindre un canal
    inviteMemberToChannel: async (channelId: UUID, memberId: UUID): Promise<void> => {
        await apiClient.post(`/channels/${channelId}/invite/${memberId}`);
    },

    // Obtenir les membres d'un canal
    getChannelMembers: async (channelId: UUID): Promise<any[]> => {
        const response = await apiClient.get(`/channels/${channelId}/members`);
        return response.data;
    },
};

export default channelService;
