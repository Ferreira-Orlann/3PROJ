import axios from "axios";

export interface Reaction {
  uuid: string;
  emoji: string;
  count: number;
  reactedByUser: boolean; // Pour savoir si l'user a déjà réagi avec cet emoji
}

interface GetReactionsParams {
  workspaceUuid?: string;
  userUuid?: string;
  channelUuid: string;
  messageUuid: string;
}

interface AddReactionDto {
  emoji: string;
  userUuid: string;
}

interface AddReactionParams extends GetReactionsParams {
  dto: AddReactionDto;
}

interface RemoveReactionParams extends GetReactionsParams {
  reactionUuid: string;
}

const baseUrl = "http://localhost:3000"; // adapte selon ton serveur

export const ReactionsService = {
  async getReactions(params: GetReactionsParams): Promise<Reaction[]> {
    const { workspaceUuid, userUuid, channelUuid, messageUuid } = params;
    const prefix = workspaceUuid
      ? `/workspaces/${workspaceUuid}`
      : userUuid
      ? `/users/${userUuid}`
      : "";
    const url = `${baseUrl}${prefix}/channels/${channelUuid}/messages/${messageUuid}/reactions`;
    const res = await axios.get(url);
    return res.data;
  },

  async addReaction(params: AddReactionParams): Promise<Reaction> {
    const { workspaceUuid, userUuid, channelUuid, messageUuid, dto } = params;
    const prefix = workspaceUuid
      ? `/workspaces/${workspaceUuid}`
      : userUuid
      ? `/users/${userUuid}`
      : "";
    const url = `${baseUrl}${prefix}/channels/${channelUuid}/messages/${messageUuid}/reactions`;
    const res = await axios.post(url, dto);
    return res.data;
  },

  async removeReaction(params: RemoveReactionParams): Promise<void> {
    const { workspaceUuid, userUuid, channelUuid, messageUuid, reactionUuid } = params;
    const prefix = workspaceUuid
      ? `/workspaces/${workspaceUuid}`
      : userUuid
      ? `/users/${userUuid}`
      : "";
    const url = `${baseUrl}${prefix}/channels/${channelUuid}/messages/${messageUuid}/reactions/${reactionUuid}`;
    await axios.delete(url);
  },
};
