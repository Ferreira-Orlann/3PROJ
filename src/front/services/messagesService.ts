import axios from "axios";
import { UUID } from "crypto";

const API_BASE = "http://localhost:3000";

// Récupérer les messages privés d’un user
export async function getPrivateMessages(userUuid: string, token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const url = `${API_BASE}/users/${userUuid}/messages`;
  const response = await axios.get(url, { headers });

  console.log("data",response.data)
  return response.data;
}

export async function sendPrivateMessage(
  messageData: {
    message: string;
    is_public: boolean;
    source_uuid: UUID;
    destination_uuid: UUID;
    
    file_url?: string;
  },
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};


  console.log("message", messageData)

  const response = await axios.post(
    `${API_BASE}/users/${messageData.destination_uuid}/messages`,
    messageData,
    { headers }
  );

  return response.data;
}

// Modifier un message privé
export async function updatePrivateMessage(
  userUuid: string,
  messageUuid: string,
  newContent: string,
  token?: string
) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const url = `${API_BASE}/users/${userUuid}/messages/${messageUuid}`;
  const response = await axios.put(url, { message: newContent }, { headers });
  return response.data;
}

// Upload de fichier (optionnel)
export async function uploadFile(file: File, token?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
    : {};
  const response = await axios.post(`${API_BASE}/upload`, formData, { headers });
  return response.data.fileUrl;
}
