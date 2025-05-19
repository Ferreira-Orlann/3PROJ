// src/hooks/useMessages.ts
import { useEffect, useState } from "react";
import { messageService } from "../services/message.service";

export const useMessages = (workspaceUuid: string, channelUuid: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messageService.getMessages(workspaceUuid, channelUuid);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

 // const interval = setInterval(() => {
  //  fetchMessages();
  //}, 3000); 

  const sendMessage = async (content: string) => {
    try {
      const newMessage = await messageService.sendMessage(workspaceUuid, channelUuid, content);
      setMessages((prev) => [...prev, newMessage]);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [workspaceUuid, channelUuid]);

  return { messages, loading, error, sendMessage };
};
