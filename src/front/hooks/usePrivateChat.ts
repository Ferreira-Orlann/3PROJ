import { useEffect, useState, useCallback } from "react";
import {
  getPrivateMessages,
  sendPrivateMessage,
  updatePrivateMessage as apiUpdate,
  deletePrivateMessage as apiDelete,
} from "../services/messagesService";
import type { MessageDTO } from "../services/messagesService";
import type { Message } from "../types/messages";
import WebSocketService from "./socketInstance";

function mapDtoToMessage(dto: MessageDTO): Message {
  return {
    uuid: dto.uuid,
    message: dto.message,
    source_uuid: typeof dto.source === "string" ? dto.source : dto.source.uuid,
    destination_uuid: typeof dto.destination_user === "string"
      ? dto.destination_user
      : dto.destination_user.uuid,
    is_public: dto.is_public,
    date: dto.date,
    file_url: dto.file_url,
    reply_to_uuid: dto.reply_to_uuid,
    edited: dto.edited,
  };
}

export function usePrivateChat(currentUserUuid: string, token: string, selectedUserUuid: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchMessages = useCallback(async () => {
    if (!selectedUserUuid) return setMessages([]);

    try {
      const all = [
        ...await getPrivateMessages(currentUserUuid, token),
        ...await getPrivateMessages(selectedUserUuid, token)
      ]
        .map(mapDtoToMessage)
        .filter(
          (m) =>
            (m.source_uuid === currentUserUuid && m.destination_uuid === selectedUserUuid) ||
            (m.source_uuid === selectedUserUuid && m.destination_uuid === currentUserUuid)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setMessages(all);
    } catch (err) {
      console.error("Erreur fetch messages :", err);
    }
  }, [currentUserUuid, selectedUserUuid, token]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const sendMessage = useCallback(async (text: string, fileUrl?: string, replyToUuid?: string) => {
    if (!selectedUserUuid) return;
    try {
      const dto = await sendPrivateMessage({
        message: text,
        source_uuid: currentUserUuid,
        destination_uuid: selectedUserUuid,
        is_public: false,
        file_url: fileUrl,
        reply_to_uuid: replyToUuid,
      }, token);
      const msg = mapDtoToMessage(dto);
      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.error("Erreur envoi message :", err);
    }
  }, [currentUserUuid, selectedUserUuid, token]);

  const updateMessage = useCallback(async (uuid: string, data: { message: string; file_url?: string }) => {
    try {
      const updated = await apiUpdate(currentUserUuid, uuid, data, token);
      const msg = mapDtoToMessage(updated);
      setMessages((prev) => prev.map((m) => (m.uuid === uuid ? msg : m)));
    } catch (err) {
      console.error("Erreur modification message :", err);
    }
  }, [currentUserUuid, token]);

  const deleteMessage = useCallback(async (uuid: string) => {
    try {
      await apiDelete(currentUserUuid, uuid, token);
      setMessages((prev) => prev.filter((m) => m.uuid !== uuid));
    } catch (err) {
      console.error("Erreur suppression message :", err);
    }
  }, [currentUserUuid, token]);

  // WebSocket - réception messages en temps réel
  useEffect(() => {
    if (!selectedUserUuid || !currentUserUuid) return;

    const handle = (dto: MessageDTO) => {
      const msg = mapDtoToMessage(dto);
      const isPrivate = !msg.is_public;
      const isRelevant =
        (msg.source_uuid === currentUserUuid && msg.destination_uuid === selectedUserUuid) ||
        (msg.source_uuid === selectedUserUuid && msg.destination_uuid === currentUserUuid);

      if (isPrivate && isRelevant) {
        setMessages((prev) => prev.some((m) => m.uuid === msg.uuid) ? prev : [...prev, msg]);
      }
    };

    const unsub = WebSocketService.on("message_sent", handle);
    return () => unsub();
  }, [currentUserUuid, selectedUserUuid]);

  return { messages, fetchMessages, sendMessage, updateMessage, deleteMessage };
}
