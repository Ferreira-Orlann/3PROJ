import axios from "axios";

const API_BASE = "http://localhost:3000";

export interface ReactionDTO {
  uuid: string;
  emoji: string;
  user_uuid: string;
  message_uuid: string;
}

export async function getReactionsForMessage(messageUuid: string): Promise<ReactionDTO[]> {
  const resp = await axios.get(`${API_BASE}/users/me/channels/x/messages/${messageUuid}/reactions`);
  return resp.data;
}

// POST qui remplace la réaction de l'utilisateur sur le message (API à adapter)
export async function addOrUpdateReactionToMessage(messageUuid: string, dto: {
  emoji: string;
  user_uuid: string;
  message_uuid: string;
}): Promise<ReactionDTO> {
  // ici, on suppose que le backend remplace la réaction automatiquement ou alors on simule avec suppression + ajout
  // sinon, il faudrait faire un DELETE + POST en 2 appels
  
  const resp = await axios.post(
    `${API_BASE}/users/me/channels/x/messages/${messageUuid}/reactions`,
    dto
  );
  return resp.data;
}
