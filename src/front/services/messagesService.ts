// src/services/messagesService.ts
import axios from "axios";

export interface MessageDTO {
  uuid: string;
  message: string;
  source: { uuid: string } | string;
  destination_user: { uuid: string } | string;
  is_public: boolean;
  date: string;
  file_url?: string;
  reply_to_uuid?: string;
  edited?: boolean;
}


const API_BASE = "http://localhost:3000";

export async function getPrivateMessages(
  userUuid: string,
  token?: string
): Promise<MessageDTO[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const resp = await axios.get(`${API_BASE}/users/${userUuid}/messages`, { headers });
  return resp.data;
}

export async function sendPrivateMessage(
  data: {
    message: string;
    destination_uuid: string;
    source_uuid: string;
    is_public: boolean;
    file_url?: string;
    reply_to_uuid?: string;
  },
  token?: string
): Promise<MessageDTO> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const payload: any = {
    message: data.message,
    is_public: data.is_public,
    source_uuid: data.source_uuid,
    destination_uuid: data.destination_uuid,
  };

  if (data.file_url) {
    payload.file_url = data.file_url;
  }

  if (data.reply_to_uuid) {
    payload.reply_to_uuid = data.reply_to_uuid;
  }

  const resp = await axios.post(
    `${API_BASE}/users/${data.destination_uuid}/messages`,
    payload,
    { headers }
  );

  return resp.data;
}


export async function uploadFile(file: File, token?: string): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
    : {};
  const resp = await axios.post(`${API_BASE}/files/upload`, form, { headers });
  return resp.data.fileUrl;
}
