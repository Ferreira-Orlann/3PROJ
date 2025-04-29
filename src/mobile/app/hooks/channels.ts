import { useState, useEffect } from "react";
import { UUID } from "crypto";

// Import API services
import workspaceService from "../services/api/endpoints/workspaces";
import channelService, {
    Channel as ApiChannel,
} from "../services/api/endpoints/channels";
import messageService, {
    Message as ApiMessage,
    Attachment,
    MessageReaction,
    CreateMessageData,
} from "../services/api/endpoints/messages";

// Define local interfaces to match the API responses with our UI needs
interface Channel {
    id: UUID;
    name: string;
    is_public: boolean;
    description?: string;
}

interface Workspace {
    id: UUID;
    name: string;
    is_public: boolean;
    channels: Channel[];
}

interface Message {
    id: UUID;
    content: string;
    sender: string;
    avatar: string | null;
    timestamp: string;
    reactions: MessageReaction[];
    attachments: Attachment[];
}

export const useChannelScreen = (workspaceId: string, channelId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les informations sur l'espace de travail et le canal
    useEffect(() => {
        const fetchWorkspaceAndChannel = async () => {
            setIsLoading(true);
            try {
                // Récupérer les détails de l'espace de travail
                const workspaceData = await workspaceService.getWorkspaceByUuid(
                    workspaceId as UUID,
                );

                // Récupérer les détails du canal
                const channelData = await channelService.getChannelById(
                    channelId as UUID,
                );

                // Construire l'objet workspace avec les données
                const completeWorkspace: Workspace = {
                    id: workspaceData.workspaceId,
                    name: workspaceData.name,
                    is_public: workspaceData.is_public,
                    channels: [], // Nous n'avons pas besoin de tous les canaux ici
                };

                // Construire l'objet channel avec les données
                const completeChannel: Channel = {
                    id: channelData.id,
                    name: channelData.name,
                    is_public: channelData.is_public,
                    description: channelData.description,
                };

                setWorkspace(completeWorkspace);
                setChannel(completeChannel);
                setError(null);
            } catch (err) {
                console.error("Erreur lors du chargement des données:", err);
                setError("Impossible de charger les données du canal.");
            } finally {
                setIsLoading(false);
            }
        };

        if (workspaceId && channelId) {
            fetchWorkspaceAndChannel();
        }
    }, [workspaceId, channelId]);

    // Charger les messages pour le canal
    useEffect(() => {
        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const messageData = await messageService.getMessages(
                    workspaceId as UUID,
                    channelId as UUID,
                );

                // Transformer les messages API en format local
                const formattedMessages: Message[] = messageData.map((msg) => ({
                    id: msg.id,
                    content: msg.content,
                    sender: msg.username,
                    avatar: null, // L'API ne fournit pas d'avatar pour le moment
                    timestamp: new Date(msg.createdAt).toLocaleTimeString(
                        "fr-FR",
                        { hour: "2-digit", minute: "2-digit" },
                    ),
                    reactions: msg.reactions || [],
                    attachments: msg.attachments || [],
                }));

                setMessages(formattedMessages);
                setError(null);
            } catch (err) {
                console.error("Erreur lors du chargement des messages:", err);
                setError("Impossible de charger les messages.");
            } finally {
                setIsLoading(false);
            }
        };

        if (workspaceId && channelId) {
            fetchMessages();
        }
    }, [workspaceId, channelId]);

    // Envoyer un nouveau message
    const handleSendMessage = async (
        content: string,
        attachments: File[] = [],
    ) => {
        if (!content.trim() && attachments.length === 0) return;

        try {
            // Préparer les données du message
            const messageData: CreateMessageData = {
                content: content,
                channelId: channelId,
                workspaceId: workspaceId,
                attachments: attachments,
            };

            // Envoyer le message via l'API
            const sentMessage = await messageService.sendMessage(messageData);

            // Ajouter le message à l'état local
            const newMessage: Message = {
                id: sentMessage.id,
                content: sentMessage.content,
                sender: sentMessage.username,
                avatar: null,
                timestamp: new Date(sentMessage.createdAt).toLocaleTimeString(
                    "fr-FR",
                    { hour: "2-digit", minute: "2-digit" },
                ),
                reactions: [],
                attachments: sentMessage.attachments || [],
            };

            setMessages([...messages, newMessage]);
        } catch (err) {
            console.error("Erreur lors de l'envoi du message:", err);
            // Gérer l'erreur dans l'UI
        }
    };

    // Ajouter une réaction à un message
    const handleAddReaction = async (messageId: string, emoji: string) => {
        try {
            // Appeler l'API pour ajouter la réaction
            await messageService.addReaction(
                workspaceId as UUID,
                channelId as UUID,
                messageId as UUID,
                emoji,
            );

            // Mettre à jour l'état local
            const updatedMessages = messages.map((msg) => {
                if (msg.id === messageId) {
                    const existingReactionIndex = msg.reactions.findIndex(
                        (r: MessageReaction) => r.emoji === emoji,
                    );

                    if (existingReactionIndex >= 0) {
                        // La réaction existe déjà, incrémenter le compteur
                        const updatedReactions = [...msg.reactions];
                        updatedReactions[existingReactionIndex] = {
                            ...updatedReactions[existingReactionIndex],
                            count:
                                updatedReactions[existingReactionIndex].count +
                                1,
                            users: [
                                ...updatedReactions[existingReactionIndex]
                                    .users,
                                "currentUser",
                            ],
                        };

                        return { ...msg, reactions: updatedReactions };
                    } else {
                        // Nouvelle réaction
                        return {
                            ...msg,
                            reactions: [
                                ...msg.reactions,
                                { emoji, count: 1, users: ["currentUser"] },
                            ],
                        };
                    }
                }
                return msg;
            });

            setMessages(updatedMessages);
        } catch (err) {
            console.error("Erreur lors de l'ajout de la réaction:", err);
            // Gérer l'erreur dans l'UI
        }
    };

    // Basculer la visibilité de la barre latérale
    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible);
    };

    return {
        workspace,
        channel,
        messages,
        sidebarVisible,
        isLoading,
        error,
        handleSendMessage,
        handleAddReaction,
        toggleSidebar,
    };
};

export default useChannelScreen;
