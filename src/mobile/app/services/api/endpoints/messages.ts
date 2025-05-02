import apiClient from "../client";
import { UUID } from "crypto";

export interface Message {
    uuid: UUID;
    message: string;
    is_public: boolean;
    date: string;
    source:
        | {
              uuid: UUID;
              username: string;
          }
        | string;
    destination_channel:
        | {
              uuid: UUID;
          }
        | string
        | null;
    destination_user:
        | {
              uuid: UUID;
          }
        | string
        | null;
    createdReaction?: Reaction[];
}

export interface Reaction {
    uuid: UUID;
    emoji: string;
    user: {
        uuid: UUID;
        username: string;
    };
}

export interface Attachment {
    uuid: UUID;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
}

export interface CreateMessageData {
    message: string;
    source_uuid: UUID;
    destination_uuid: UUID;
    is_public: boolean;
}

export interface AttachmentUploadData {
    file: File;
    messageUuid?: UUID;
}

const messageService = {
    getMessages: async (
        workspaceUuid: UUID,
        channelUuid: UUID,
    ): Promise<Message[]> => {
        const response = await apiClient.get<Message[]>(
            `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`,
        );
        return response.data;
    },

    getDirectMessages: async (
        recipientUuid: UUID
    ): Promise<Message[]> => {
        // Pour les messages privés, on utilise la nouvelle API users/recipientId/messages
        // où recipientId est l'ID de l'utilisateur avec qui on discute
        
        console.log(`Fetching direct messages with user ${recipientUuid}`);
        const response = await apiClient.get<Message[]>(
            `/users/${recipientUuid}/messages`,
        );
        return response.data;
    },

    sendWorkspaceMessage: async (
        workspaceUuid: UUID,
        channelUuid: UUID,
        messageData: CreateMessageData,
    ): Promise<Message> => {
        const response = await apiClient.post<Message>(
            `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`,
            messageData,
        );
        return response.data;
    },

    sendDirectMessage: async (
        recipientUuid: UUID,
        messageData: CreateMessageData
    ): Promise<Message> => {
        // Pour les messages privés, on utilise la nouvelle API users/recipientId/messages
        // où recipientId est l'ID de l'utilisateur à qui on envoie le message

        // Vérification des paramètres
        if (!recipientUuid) {
            console.error("sendDirectMessage - recipientUuid est vide ou null");
            throw new Error("L'UUID du destinataire est requis");
        }
        
        if (!messageData.source_uuid) {
            console.error("sendDirectMessage - source_uuid est vide ou null dans messageData");
            throw new Error("L'UUID de l'expéditeur est requis");
        }
        
        if (!messageData.destination_uuid) {
            console.error("sendDirectMessage - destination_uuid est vide ou null dans messageData");
            throw new Error("L'UUID du destinataire est requis dans messageData");
        }
        
        // S'assurer que les UUIDs dans messageData correspondent aux attentes
        if (messageData.destination_uuid !== recipientUuid) {
            console.warn("sendDirectMessage - destination_uuid ne correspond pas à recipientUuid, correction automatique");
            messageData.destination_uuid = recipientUuid;
        }
        
        console.log(`sendDirectMessage - Envoi d'un message à l'utilisateur ${recipientUuid}`);
        console.log(`sendDirectMessage - Données du message:`, messageData);
        
        try {
            const response = await apiClient.post<Message>(
                `/users/${recipientUuid}/messages`,
                messageData,
            );
            console.log(`sendDirectMessage - Message envoyé avec succès, réponse:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`sendDirectMessage - Erreur lors de l'envoi du message:`, error.response?.data || error.message);
            throw error;
        }
    },

    editMessage: async (
        workspaceUuid: UUID | null,
        userUuid: UUID | null,
        channelUuid: UUID,
        messageUuid: UUID,
        content: string,
    ): Promise<Message> => {
        let url;
        if (workspaceUuid) {
            url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        } else {
            url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        }

        const response = await apiClient.put<Message>(url, {
            message: content,
        });
        return response.data;
    },

    deleteMessage: async (
        workspaceUuid: UUID | null,
        userUuid: UUID | null,
        channelUuid: UUID,
        messageUuid: UUID,
    ): Promise<void> => {
        let url;
        if (workspaceUuid) {
            url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        } else {
            url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}`;
        }

        await apiClient.delete(url);
    },
};

export default messageService;
