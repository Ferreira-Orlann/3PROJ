// src/front/services/messagesService.ts
import axios from "axios";

const API_BASE = "http://localhost:3000";

export async function getPrivateMessages(
  userUuid: string, // le user sélectionné
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`${API_BASE}/users/${userUuid}/messages`, {
    headers,
  });
  return response.data;
}




export async function sendPrivateMessage(
  messageData: {
    message: string;
    is_public: boolean;
    source_uuid: string;
    destination_uuid: string;
    reply_to_uuid?: string;
    file_url?: string;
  },
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.post(
    `${API_BASE}/users/${messageData.destination_uuid}/messages`,
    messageData,
    { headers }
  );

  return response.data;
}

export async function reactToMessage(
  messageUuid: string,
  reaction: string,
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.post(
    `${API_BASE}/messages/${messageUuid}/reactions`,
    { reaction },
    { headers }
  );

  return response.data;
}

export async function uploadFile(file: File, token?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const headers = token ? { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } : {};

  const response = await axios.post(`${API_BASE}/upload`, formData, { headers });
  return response.data.fileUrl; 
}

export async function updatePrivateMessage(
  messageUuid: string,
  newContent: string,
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.patch(
    `${API_BASE}/messages/${messageUuid}`,
    { message: newContent },
    { headers }
  );
  return response.data;
}
