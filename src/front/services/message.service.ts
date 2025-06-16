// src/services/message.service.ts
import authService from './auth.service';

export const messageService = {
  sendMessage: async (workspaceUuid: string, channelUuid: string, content: string) => {
  const session = authService.getSession();
  console.log("Session récupérée :", session);


    const token = authService.getSession().token;
    console.log("Session :", session);
    const userUuid = session?.owner;
    console.log("User UUID :", userUuid);

    const response = await fetch(`http://localhost:3000/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: content, source_uuid: userUuid }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi du message");
    }

    return await response.json();
  },

  getMessages: async (workspaceUuid: string, channelUuid: string) => {
    const token = authService.getSession().token;
    const response = await fetch(`http://localhost:3000/workspaces/${workspaceUuid}/channels/${channelUuid}/messages`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erreur lors du chargement des messages");
    }

    return await response.json();
  }
};
