// src/services/socket.service.ts
import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect(workspaceUuid: string, channelUuid: string) {
    if (!this.socket || !this.socket.connected) {
      this.socket = io("http://localhost:3000", {
        query: { workspaceUuid, channelUuid },
      });

      this.socket.on("connect", () => {
        console.log("🔌 Connecté au WebSocket");
      });

      this.socket.on("disconnect", () => {
        console.log("🔌 Déconnecté du WebSocket");
      });
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
