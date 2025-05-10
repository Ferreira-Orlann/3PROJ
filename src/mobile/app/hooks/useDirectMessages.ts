import { useState, useEffect } from "react";
import { UUID } from "crypto";
import messageService, { Message } from "../services/api/endpoints/messages";
import userService, { User } from "../services/api/endpoints/users";
import { useAuth } from "../context/AuthContext";

// Interface pour représenter un utilisateur avec qui on a une conversation privée
export interface DirectMessageUser {
    uuid: UUID;
    username: string;
    lastMessage?: string;
    lastMessageDate?: Date;
    unreadCount?: number;
}

// Interface pour l'état du hook
interface DirectMessagesState {
    users: DirectMessageUser[];
    isLoading: boolean;
    error: string | null;
}

export const useDirectMessages = () => {
    const auth = useAuth();
    const [state, setState] = useState<DirectMessagesState>({
        users: [],
        isLoading: false,
        error: null,
    });

    // Fonction pour extraire les utilisateurs uniques des messages directs
    const extractUsersFromMessages = async (
        messages: Message[],
    ): Promise<DirectMessageUser[]> => {
        if (!messages || messages.length === 0) return [];

        const currentUser = auth.user;
        if (!currentUser) return [];

        // Map pour stocker les utilisateurs uniques par UUID
        const userMap = new Map<string, DirectMessageUser>();

        // Parcourir tous les messages pour extraire les utilisateurs uniques
        for (const message of messages) {
            let otherUserUuid: UUID | null = null;

            // Déterminer l'autre utilisateur dans la conversation
            if (message.destination_user) {
                // Si destination_user est un objet avec uuid
                if (
                    typeof message.destination_user === "object" &&
                    message.destination_user.uuid
                ) {
                    otherUserUuid = message.destination_user.uuid;
                }
                // Si destination_user est une chaîne (UUID)
                else if (typeof message.destination_user === "string") {
                    otherUserUuid = message.destination_user as UUID;
                }
            }

            // Si source est un objet avec uuid et username
            if (typeof message.source === "object" && message.source.uuid) {
                // Si la source n'est pas l'utilisateur actuel, c'est l'autre utilisateur
                if (message.source.uuid !== currentUser.uuid) {
                    otherUserUuid = message.source.uuid;
                }
            }
            // Si source est une chaîne (UUID)
            else if (
                typeof message.source === "string" &&
                message.source !== currentUser.uuid
            ) {
                otherUserUuid = message.source as UUID;
            }

            // Si on a trouvé un autre utilisateur et qu'il n'est pas déjà dans la map
            if (otherUserUuid && !userMap.has(otherUserUuid.toString())) {
                try {
                    // Récupérer les informations de l'utilisateur
                    const userData =
                        await userService.getUserById(otherUserUuid);

                    userMap.set(otherUserUuid.toString(), {
                        uuid: otherUserUuid,
                        username: userData.username,
                        lastMessage: message.message,
                        lastMessageDate: new Date(message.date),
                        unreadCount: 0, // À implémenter plus tard
                    });
                } catch (error) {
                    console.error(
                        `Error fetching user data for ${otherUserUuid}:`,
                        error,
                    );
                }
            }

            // Mettre à jour le dernier message si nécessaire
            if (otherUserUuid && userMap.has(otherUserUuid.toString())) {
                const user = userMap.get(otherUserUuid.toString());
                const messageDate = new Date(message.date);

                if (
                    user &&
                    (!user.lastMessageDate ||
                        messageDate > user.lastMessageDate)
                ) {
                    userMap.set(otherUserUuid.toString(), {
                        ...user,
                        lastMessage: message.message,
                        lastMessageDate: messageDate,
                    });
                }
            }
        }

        // Convertir la map en tableau et trier par date du dernier message (plus récent en premier)
        return Array.from(userMap.values()).sort((a, b) => {
            if (!a.lastMessageDate) return 1;
            if (!b.lastMessageDate) return -1;
            return b.lastMessageDate.getTime() - a.lastMessageDate.getTime();
        });
    };

    // Fonction pour récupérer tous les messages directs
    const fetchDirectMessages = async () => {
        if (!auth.user) return;

        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            // Récupérer tous les messages directs de l'utilisateur actuel
            // Note: Comme nous n'avons pas d'endpoint spécifique pour récupérer tous les utilisateurs avec qui on a des conversations,
            // nous devons d'abord récupérer les messages et en extraire les utilisateurs
            const allMessages = await messageService.getDirectMessages(
                auth.user.uuid as UUID,
            );

            // Extraire les utilisateurs uniques des messages
            const users = await extractUsersFromMessages(allMessages);

            setState({
                users,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error("Error fetching direct messages:", error);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: "Impossible de récupérer les messages directs.",
            }));
        }
    };

    // Charger les messages directs au montage du composant
    useEffect(() => {
        if (auth.user) {
            fetchDirectMessages();
        }
    }, [auth.user]);

    return {
        state,
        refreshDirectMessages: fetchDirectMessages,
    };
};

export default useDirectMessages;
