import authService from './auth.service';  


export const channelService = {
    // Récupérer tous les canaux
    getAll: async () => {
        const token = authService.getSession().token;
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

    // Récupérer les canaux filtrés par workspaceUuid
    getAllFiltered: async (workspaceUuid: string) => {
        const allChannels = await channelService.getAll();
    
        // Optionnel : debug pour voir ce qui arrive
        console.log("Filtrage des canaux", allChannels.map(c => ({
            name: c.name,
            workspace: c.workspace
        })));
    
        return allChannels.filter((channel: { workspace: string }) =>
            channel.workspace === workspaceUuid
        );
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
