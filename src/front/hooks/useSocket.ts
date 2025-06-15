import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import socketInstance from "../hooks/socketInstance";

export function useSocket(token?: string): Socket | undefined {
  const socketRef = useRef<Socket>();

  useEffect(() => {
    if (!token) return;

    socketInstance.connect(token).then(() => {
      const socket = socketInstance.getSocket();
      if (!socket) return;

      socketRef.current = socket;

      console.log("✅ WebSocket connecté :", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ WebSocket déconnecté");
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return socketRef.current;
}
