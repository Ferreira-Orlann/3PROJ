// src/services/channel.service.ts
import authService from './auth.service';  // Correctement importé

export const channelService = {
    getAll: async () => {
        const token = authService.getSession().token; // Utilisation correcte de authService
        if (!token) {
            throw new Error("Token non trouvé");
        }

        const response = await fetch("http://localhost:3000/channels", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la récupération des canaux");
        }

        return await response.json();
    },

    create: async (workspaceUuid: string, name: string) => {
        const token = authService.getSession().token;
        if (!token) {
            throw new Error("Token non trouvé");
        }

        const response = await fetch(`http://localhost:3000/workspaces/${workspaceUuid}/channels`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la création du canal");
        }

        return await response.json();
    }
};
