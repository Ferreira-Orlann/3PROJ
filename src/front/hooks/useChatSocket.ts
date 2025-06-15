import { useEffect } from "react";
import WebSocketService from "../hooks/socketInstance";

type Props = {
  token: string;
  onMessageReceived: (message: any) => void;
};

const useChatSocket = ({ token, onMessageReceived }: Props) => {
  useEffect(() => {
    let isMounted = true;

    WebSocketService.connect(token)
      .then(() => {
        console.log("WebSocket connecté");

        WebSocketService.on("message_sent", (data) => {
          if (isMounted) {
            onMessageReceived(data);
          }
        });
      })
      .catch((error) => {
        console.error("Erreur de connexion WebSocket :", error);
      });

    return () => {
      isMounted = false;
      WebSocketService.disconnect();
    };
  }, [token]);
};

export default useChatSocket;
