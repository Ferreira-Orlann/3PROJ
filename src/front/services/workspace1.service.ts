// channel.service.ts
const getAll = async (token: string) => {
    try {
        console.log("Token envoyé:", token);
        const res = await fetch("http://localhost:3000/channels", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            const err = await res.json();
            console.error("Erreur API Channel:", err);
            throw new Error(err?.message || "Erreur lors de la récupération des channels");
        }

        const data = await res.json();
        console.log("Channels récupérés:", data);
        return data;
    } catch (err: any) {
        console.error("Erreur ChannelService:", err.message);
        throw new Error(err.message || "Erreur inconnue");
    }
};

export default { getAll };
