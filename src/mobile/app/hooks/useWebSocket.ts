import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import WebSocketService from '../services/websocket/websocket.service';

/**
 * Hook personnalisé pour gérer la connexion WebSocket
 * @returns Un objet contenant le socket et l'état de connexion
 */
export default function useWebSocket() {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      return;
    }

    // Connexion au WebSocket
    const connectWebSocket = async () => {
      try {
        const connected = await WebSocketService.connect(token);
        setIsConnected(connected);
        console.log('WebSocket connecté avec succès');
      } catch (error) {
        console.error('Erreur de connexion WebSocket:', error);
        setIsConnected(false);
      }
    };

    // Se connecter au WebSocket
    connectWebSocket();

    // Nettoyer la connexion lors du démontage
    return () => {
      if (WebSocketService.isConnected()) {
        WebSocketService.disconnect();
        setIsConnected(false);
      }
    };
  }, [token, user]);

  // Créer une fonction wrapper pour sendEvent qui utilise le socket courant
  const sendEvent = (event: string, payload: any) => {
    const socket = WebSocketService.getSocket();
    if (socket) {
      WebSocketService.sendEvent(socket, event, payload);
    } else {
      console.warn("WebSocket - Impossible d'envoyer un événement: socket non disponible");
    }
  };

  return {
    socket: WebSocketService.getSocket(),
    isConnected,
    addListener: WebSocketService.addSocketListener.bind(WebSocketService),
    removeListener: WebSocketService.removeSocketListener.bind(WebSocketService),
    sendEvent
  };
}
