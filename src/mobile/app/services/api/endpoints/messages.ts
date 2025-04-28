import apiClient from '../client';
import { UUID } from 'crypto';

export interface Message {
  uuid: UUID;
  message: string;
  is_public: boolean;
  date: string;
  source: {
    uuid: UUID;
    username: string;
  } | string;
  destination_channel: {
    uuid: UUID;
  } | string | null;
  destination_user: {
    uuid: UUID;
  } | string | null;
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
      `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`
    );
    return response.data;
  },

  getDirectMessages: async (
    userUuid: UUID,
    channelUuid: UUID,
  ): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>(
      `/users/${userUuid}/channels/${channelUuid}/messages`
    );
    return response.data;
  },

  sendWorkspaceMessage: async (
    workspaceUuid: UUID,
    channelUuid: UUID,
    messageData: CreateMessageData
  ): Promise<Message> => {
    const response = await apiClient.post<Message>(
      `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`,
      messageData
    );
    return response.data;
  },

  sendDirectMessage: async (
    userUuid: UUID,
    channelUuid: UUID,
    messageData: CreateMessageData
  ): Promise<Message> => {
    const response = await apiClient.post<Message>(
      `/users/${userUuid}/channels/${channelUuid}/messages`,
      messageData
    );
    return response.data;
  },

  editMessage: async (
    workspaceUuid: UUID | null,
    userUuid: UUID | null,
    channelUuid: UUID,
    messageUuid: UUID,
    content: string
  ): Promise<Message> => {
    let url;
    if (workspaceUuid) {
      url = `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}`;
    } else {
      url = `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}`;
    }
    
    const response = await apiClient.put<Message>(url, { message: content });
    return response.data;
  },

  deleteMessage: async (
    workspaceUuid: UUID | null,
    userUuid: UUID | null,
    channelUuid: UUID,
    messageUuid: UUID
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
