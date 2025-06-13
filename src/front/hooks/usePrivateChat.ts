// src/hooks/usePrivateChat.ts
import { useEffect, useState, useCallback } from "react";
import { getPrivateMessages, sendPrivateMessage } from "../services/messagesService";
import type { MessageDTO } from "../services/messagesService";
import type { Message } from "../types/messages";

function mapDtoToMessage(dto: MessageDTO): Message {
  return {
    uuid: dto.uuid,
    message: dto.message,
    source_uuid: typeof dto.source === "string" ? dto.source : dto.source.uuid,
    destination_uuid:
      typeof dto.destination_user === "string" ? dto.destination_user : dto.destination_user.uuid,
    is_public: dto.is_public,
    date: dto.date,
    file_url: dto.file_url,
    reply_to_uuid: dto.reply_to_uuid,
    edited: dto.edited,
  };
}

export function usePrivateChat(
  currentUserUuid: string,
  token: string,
  selectedUserUuid: string | null
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!selectedUserUuid) return;
    setLoading(true);
    try {
      // On récupère les messages reçus par moi
      const received = await getPrivateMessages(currentUserUuid, token);

      // On récupère les messages reçus par l'autre (donc ceux que j'ai envoyés)
      const sent = await getPrivateMessages(selectedUserUuid, token);

      // On fusionne et filtre pour ne garder que notre conversation
      const all = [...received, ...sent]
        .map(mapDtoToMessage)
        .filter(
          (m) =>
            (m.source_uuid === currentUserUuid && m.destination_uuid === selectedUserUuid) ||
            (m.source_uuid === selectedUserUuid && m.destination_uuid === currentUserUuid)
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setMessages(all);
    } catch (e) {
      console.error("Erreur lors du fetch des messages :", e);
    }
    setLoading(false);
  }, [currentUserUuid, selectedUserUuid, token]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = useCallback(
    async (text: string, fileUrl?: string, replyTo?: string) => {
      if (!selectedUserUuid) return;
      const dto = {
        message: text,
        source_uuid: currentUserUuid,
        destination_uuid: selectedUserUuid,
        is_public: false,
        file_url: fileUrl,
        reply_to_uuid: replyTo,
      };
      try {
        const saved = await sendPrivateMessage(dto, token);
        setMessages((prev) => [...prev, mapDtoToMessage(saved)]);
      } catch (e) {
        console.error("Erreur lors de l'envoi du message :", e);
      }
    },
    [currentUserUuid, selectedUserUuid, token]
  );

  return { messages, loading, fetchMessages, sendMessage };
}
