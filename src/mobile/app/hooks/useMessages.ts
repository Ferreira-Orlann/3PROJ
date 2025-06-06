import { useState, useCallback, useEffect } from "react";
import { UUID } from "crypto";
import messageService, {
    Message,
    CreateMessageData,
} from "../services/api/endpoints/messages";
import websocketService from "../services/websocket/websocket.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Events } from '../../../back/events.enum';

// Tentative d'importer useAuth s'il existe
let useAuth: any = null;
try {
    const authModule = require("../context/AuthContext");
    if (authModule && typeof authModule.useAuth === "function") {
        useAuth = authModule.useAuth;
    }
} catch (error) {
    console.log("AuthContext non disponible, utilisation du mode alternatif");
}

/**
 * Hook pour gérer les messages dans un canal d'un espace de workspace
 */
export const useMessages = (
    workspaceUuid: UUID | null,
    channelUuid: UUID,
    userUuid: UUID,
    currentUserUuid: UUID,
) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isWebSocketConnected, setIsWebSocketConnected] =
        useState<boolean>(false);

    // Utiliser useAuth si disponible, sinon utiliser currentUserUuid fourni en paramètre
    let currentUser = { uuid: currentUserUuid } as {
        uuid: UUID;
        username: string;
    } | null;
    if (useAuth) {
        try {
            const authContext = useAuth();
            currentUser = authContext?.user || currentUser;
        } catch (error) {
            console.log("Erreur lors de l'utilisation de useAuth:", error);
        }
    }

    // Vérifier l'état de la connexion WebSocket périodiquement
    useEffect(() => {
        // Vérifier l'état initial de la connexion
        const initialConnected = websocketService.isConnected();
        setIsWebSocketConnected(initialConnected);

        if (!initialConnected) {
            console.log(
                "useMessages - WebSocket non connecté, tentative de connexion...",
            );
            // Tenter de se connecter si non connecté
            // Récupérer le token d'authentification depuis AsyncStorage
            const getTokenAndConnect = async () => {
                try {
                    const token = await AsyncStorage.getItem("userToken");
                    if (token) {
                        console.log(
                            "useMessages - Token récupéré, tentative de connexion WebSocket",
                        );
                        websocketService.connect(token).catch((error) => {
                            console.error(
                                "useMessages - Impossible de se connecter au WebSocket:",
                                error,
                            );
                        });
                    } else {
                        console.error(
                            "useMessages - Impossible de se connecter au WebSocket: token manquant",
                        );
                        // Essayer de récupérer le token depuis useAuth si disponible
                        if (currentUser?.uuid) {
                            console.log(
                                "useMessages - Tentative de récupération du token depuis currentUser",
                            );
                            // Utiliser l'UUID comme token temporaire si nécessaire
                            const tempToken = currentUser.uuid.toString();
                            websocketService
                                .connect(tempToken)
                                .catch((error) => {
                                    console.error(
                                        "useMessages - Impossible de se connecter au WebSocket avec UUID:",
                                        error,
                                    );
                                });
                        }
                    }
                } catch (error) {
                    console.error(
                        "useMessages - Erreur lors de la récupération du token:",
                        error,
                    );
                }
            };

            getTokenAndConnect();
        }

        // Vérifier périodiquement l'état de la connexion
        const checkInterval = setInterval(() => {
            const connected = websocketService.isConnected();
            if (connected !== isWebSocketConnected) {
                console.log(
                    `useMessages - État WebSocket changé: ${connected ? "connecté" : "déconnecté"}`,
                );
                setIsWebSocketConnected(connected);
            }
        }, 3000);

        return () => clearInterval(checkInterval);
    }, [isWebSocketConnected]);

    /**
     * Charge les messages du canal
     */
    const fetchMessages = useCallback(async () => {
        if (!channelUuid) {
            console.log(
                "useMessages - fetchMessages - Impossible de charger les messages: channelUuid manquant",
            );
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let fetchedMessages: Message[] = [];

            if (workspaceUuid) {
                // Messages de canal de workspace
                try {
                    fetchedMessages = await messageService.getMessages(
                        workspaceUuid,
                        channelUuid,
                    );
                } catch (apiError: any) {
                    console.error(
                        "useMessages - fetchMessages - Erreur API workspace:",
                        apiError,
                    );
                    if (
                        apiError?.message?.includes("ECONNREFUSED") ||
                        apiError?.code === "ERR_CONNECTION_REFUSED"
                    ) {
                        throw new Error(
                            "Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution.",
                        );
                    }
                    throw apiError;
                }
            } else if (userUuid) {
                // Messages privés
                try {
                    // Utiliser la nouvelle API pour les messages privés
                    fetchedMessages =
                        await messageService.getDirectMessages(userUuid);
                } catch (apiError: any) {
                    console.error(
                        "useMessages - fetchMessages - Erreur API messages privés:",
                        apiError,
                    );
                    if (
                        apiError?.message?.includes("ECONNREFUSED") ||
                        apiError?.code === "ERR_CONNECTION_REFUSED"
                    ) {
                        throw new Error(
                            "Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution.",
                        );
                    }
                    throw apiError;
                }
            }

            console.log(
                `useMessages - fetchMessages - ${fetchedMessages.length} messages chargés`,
            );
            setMessages(fetchedMessages);
        } catch (error: any) {
            console.error("useMessages - fetchMessages - Erreur:", error);
            setError(
                error?.message || "Erreur lors du chargement des messages",
            );
        } finally {
            setLoading(false);
        }
    }, [workspaceUuid, channelUuid, userUuid]);

    /**
     * Envoie un message
     */
    const sendMessage = useCallback(
        async (content: string) => {
            if (!channelUuid) {
                console.error(
                    "useMessages - sendMessage - Erreur: channelUuid manquant",
                );
                return null;
            }

            if (!content.trim()) {
                console.error(
                    "useMessages - sendMessage - Erreur: contenu vide",
                );
                return null;
            }

            if (!currentUser?.uuid) {
                console.error(
                    "useMessages - sendMessage - Erreur: UUID utilisateur manquant",
                );
                return null;
            }

            setError(null);

            try {
                const messageData: CreateMessageData = {
                    message: content,
                    is_public: !!workspaceUuid,
                    source_uuid: currentUser.uuid,
                    destination_uuid: channelUuid,
                };

                let newMessage: Message;

                // Essayer d'envoyer le message via WebSocket si connecté
                if (isWebSocketConnected) {
                    try {
                        if (workspaceUuid) {
                            websocketService.sendMessageToChannel(
                                channelUuid,
                                content,
                            );
                        } else if (userUuid) {
                            websocketService.sendDirectMessage(
                                userUuid,
                                content,
                            );
                        }
                        // Continuer avec l'API REST pour s'assurer que le message est bien envoyé
                    } catch (wsError) {
                        console.error(
                            "useMessages - sendMessage - Erreur WebSocket, utilisation de l'API REST:",
                            wsError,
                        );
                    }
                }

                // Envoyer le message via l'API REST (toujours faire cela, même si WebSocket est connecté)
                try {
                    if (workspaceUuid) {
                        newMessage = await messageService.sendWorkspaceMessage(
                            workspaceUuid,
                            channelUuid,
                            messageData,
                        );
                    } else if (userUuid) {
                        // Envoyer un message privé
                        console.log(
                            `useMessages - sendMessage - Envoi du message privé à l'utilisateur ${userUuid}, canal ${channelUuid}`,
                        );
                        // Utiliser la nouvelle API pour envoyer des messages privés
                        newMessage = await messageService.sendDirectMessage(
                            userUuid,
                            messageData,
                        );
                    } else {
                        throw new Error(
                            "Soit workspaceUuid soit userUuid doit être fourni",
                        );
                    }
                } catch (apiError: any) {
                    console.error(
                        "useMessages - sendMessage - Erreur API:",
                        apiError,
                    );

                    // Si WebSocket a réussi mais API a échoué, on peut considérer que le message est envoyé
                    if (isWebSocketConnected) {
                        // Créer un message temporaire avec un UUID généré côté client
                        newMessage = {
                            uuid: `temp-${Date.now()}` as unknown as UUID,
                            message: messageData.message,
                            is_public: true,
                            source: currentUser?.uuid || "",
                            date: new Date().toISOString(),
                            destination_channel: channelUuid,
                            destination_user: null,
                        } as Message;

                        console.log(
                            "useMessages - sendMessage - Message envoyé via WebSocket uniquement, création d'un message temporaire",
                        );
                    } else {
                        // Si ni WebSocket ni API n'ont réussi, lever une exception
                        if (
                            apiError?.message?.includes("ECONNREFUSED") ||
                            apiError?.code === "ERR_CONNECTION_REFUSED"
                        ) {
                            throw new Error(
                                "Impossible de se connecter au serveur. Vérifiez que le serveur est en cours d'exécution.",
                            );
                        }
                        throw apiError;
                    }
                }

                // Ajouter le nouveau message à la liste immédiatement pour une meilleure expérience utilisateur
                setMessages((prev) => {
                    // Vérifier si le message existe déjà (peut arriver avec WebSocket)
                    if (prev.some((msg) => msg.uuid === newMessage.uuid)) {
                        return prev;
                    }
                    const newMessages = [...prev, newMessage];
                    return newMessages;
                });

                return newMessage;
            } catch (err) {
                console.error(
                    "useMessages - sendMessage - Erreur lors de l'envoi du message:",
                    err,
                );
                setError(
                    "Impossible d'envoyer le message. Veuillez réessayer.",
                );
                return null;
            }
        },
        [workspaceUuid, userUuid, channelUuid, isWebSocketConnected],
    );

    /**
     * Modifie un message existant
     */
    const editMessage = useCallback(
        async (messageUuid: UUID, content: string) => {
            if (!channelUuid || !content.trim()) return;

            setError(null);

            try {
                const updatedMessage = await messageService.editMessage(
                    workspaceUuid,
                    userUuid || null,
                    channelUuid,
                    messageUuid,
                    content,
                );

                // Mettre à jour le message dans la liste
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.uuid === messageUuid ? updatedMessage : msg,
                    ),
                );

                return updatedMessage;
            } catch (err) {
                console.error(
                    "Erreur lors de la modification du message:",
                    err,
                );
                setError(
                    "Impossible de modifier le message. Veuillez réessayer.",
                );
                return null;
            }
        },
        [workspaceUuid, userUuid, channelUuid],
    );

    /**
     * Supprime un message
     */
    const deleteMessage = useCallback(
        async (messageUuid: UUID) => {
            if (!channelUuid) return;

            setError(null);

            try {
                await messageService.deleteMessage(
                    workspaceUuid,
                    userUuid || null,
                    channelUuid,
                    messageUuid,
                );

                // Supprimer le message de la liste
                setMessages((prev) =>
                    prev.filter((msg) => msg.uuid !== messageUuid),
                );

                return true;
            } catch (err) {
                console.error("Erreur lors de la suppression du message:", err);
                setError(
                    "Impossible de supprimer le message. Veuillez réessayer.",
                );
                return false;
            }
        },
        [workspaceUuid, userUuid, channelUuid],
    );

    // S'abonner aux événements WebSocket pour les messages
    useEffect(() => {
        if (!channelUuid) {
            console.log(
                "useMessages - useEffect WebSocket - Impossible de s'abonner: channelUuid manquant",
            );
            return;
        }

        if (!isWebSocketConnected) {
            console.log(
                "useMessages - useEffect WebSocket - WebSocket non connecté, en attente de connexion...",
            );
            return;
        }

        console.log(
            `useMessages - useEffect WebSocket - Abonnement aux événements pour le canal ${channelUuid}`,
        );

        // S'abonner aux événements backend et mobile (grâce au mapping dans websocket.service.ts)

        // Gérer les nouveaux messages - écouter à la fois 'message_sent' et 'message.created'
        const onMessageCreated = websocketService.on(
            "message_sent",
            (data: Message) => {
                // Vérifier si le message appartient au canal actuel
                const isForCurrentChannel =
                    (data.destination_channel &&
                        data.destination_channel.uuid === channelUuid) ||
                    (data.destination_user &&
                        data.destination_user.uuid === channelUuid);

                if (isForCurrentChannel) {
                    console.log(
                        "useMessages - WebSocket - Nouveau message pour ce canal:",
                        data,
                    );
                    setMessages((prev) => {
                        // Éviter les doublons
                        if (prev.some((m) => m.uuid === data.uuid)) {
                            return prev;
                        }
                        return [...prev, data];
                    });
                }
            },
        );

        // Gérer les mises à jour de messages - écouter à la fois 'message_updated' et 'message.updated'
        const onMessageUpdated = websocketService.on(
            "message_updated",
            (data: Message) => {
                // Vérifier si le message appartient au canal actuel
                const isForCurrentChannel =
                    (data.destination_channel &&
                        data.destination_channel.uuid === channelUuid) ||
                    (data.destination_user &&
                        data.destination_user.uuid === channelUuid);

                if (isForCurrentChannel) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.uuid === data.uuid ? data : msg,
                        ),
                    );
                }
            },
        );

        // Gérer les suppressions de messages - écouter à la fois 'message_removed' et 'message.removed'
        const onMessageRemoved = websocketService.on(
            "message_removed",
            (data: { messageUuid: UUID }) => {
                setMessages((prev) =>
                    prev.filter((msg) => msg.uuid !== data.messageUuid),
                );
            },
        );

        // Écouter également l'événement générique 'message_sent' du socket.io
        const onSocketMessage = websocketService.on(
            "message_sent",
            (data: any) => {
                if (data && data.event && data.payload) {
                    console.log(
                        `useMessages - Socket.io - Événement générique reçu: ${data.event}`,
                        data.payload,
                    );
                    // Le websocketService va automatiquement propager aux bons listeners grâce au mapping
                }
            },
        );

        // Nettoyage des abonnements
        return () => {
            console.log(
                `useMessages - useEffect WebSocket - Désabonnement des événements pour le canal ${channelUuid}`,
            );
            onMessageCreated();
            onMessageUpdated();
            onMessageRemoved();
            onSocketMessage();
        };
    }, [channelUuid, isWebSocketConnected]);

    return {
        messages,
        loading,
        error,
        fetchMessages,
        sendMessage,
        editMessage,
        deleteMessage,
    };
};

export default useMessages;
