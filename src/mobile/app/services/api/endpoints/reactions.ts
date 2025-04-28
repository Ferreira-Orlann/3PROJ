import apiClient from '../client';
import { UUID } from 'crypto';

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

const reactionService = {
  addReaction: async (
    workspaceUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    data: CreateReactionData
  ): Promise<Reaction> => {
    const response = await apiClient.post<Reaction>(
      `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
      data
    );
    return response.data;
  },

  addDirectMessageReaction: async (
    userUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    data: CreateReactionData
  ): Promise<Reaction> => {
    const response = await apiClient.post<Reaction>(
      `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`,
      data
    );
    return response.data;
  },

  removeReaction: async (
    workspaceUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    reactionUuid: UUID
  ): Promise<void> => {
    await apiClient.delete(
      `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions/${reactionUuid}`
    );
  },

  removeDirectMessageReaction: async (
    userUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID,
    reactionUuid: UUID
  ): Promise<void> => {
    await apiClient.delete(
      `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions/${reactionUuid}`
    );
  },

  getReactions: async (
    workspaceUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID
  ): Promise<Reaction[]> => {
    const response = await apiClient.get<Reaction[]>(
      `/workspaces/${workspaceUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`
    );
    return response.data;
  },

  getDirectMessageReactions: async (
    userUuid: UUID,
    channelUuid: UUID,
    messageUuid: UUID
  ): Promise<Reaction[]> => {
    const response = await apiClient.get<Reaction[]>(
      `/users/${userUuid}/channels/${channelUuid}/messages/${messageUuid}/reactions`
    );
    return response.data;
  }
};

export default reactionService;
