import { useEffect } from "react";
import { io } from "socket.io-client";

export function useMessageSocket(workspaceUuid: string, channelId: string, onNewMessage: (message: any) => void) {
  useEffect(() => {
    if (!workspaceUuid || !channelId) return;

    // Création de la socket ici directement
    const socket = io("http://localhost:3000", {
      query: { workspaceUuid, channelId },
    });

    socket.on("connect", () => {
      console.log("Socket connecté:", socket.id);
    });

    socket.on("message", onNewMessage);

    return () => {
      socket.off("message", onNewMessage);
      socket.disconnect();
    };
  }, [workspaceUuid, channelId, onNewMessage]);
}
