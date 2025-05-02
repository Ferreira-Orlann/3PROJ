import { useState, useEffect, useCallback } from "react";
import { UUID } from "crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messageService, { Message as ApiMessage, Reaction as ApiReaction } from "../services/api/endpoints/messages";
import userService from "../services/api/endpoints/users";
import { Message, Attachment } from "../services/private_messages";
import WebSocketService from "../services/websocket/websocket.service";
import { useAuth } from "../context/AuthContext";

// Type pour l'utilisateur
export interface User {
    uuid: UUID;
    name: string;
    username: string;
    email?: string;
    status?: "en ligne" | "absent" | "hors ligne";
    avatar?: string | null;
}

// Convertir un message API en message pour l'UI
const convertApiMessageToUiMessage = (apiMessage: ApiMessage, currentUserUuid: UUID | null = null): Message => {
    const sender = typeof apiMessage.source === 'string' 
        ? 'Utilisateur inconnu' 
        : apiMessage.source.username;
    
    // Vérifier si c'est l'utilisateur courant qui a envoyé le message
    let isCurrentUser = false;
    if (currentUserUuid) {
        if (typeof apiMessage.source === 'string') {
            isCurrentUser = apiMessage.source === currentUserUuid;
        } else {
            isCurrentUser = apiMessage.source.uuid === currentUserUuid;
        }
    }

    return {
        id: apiMessage.uuid,
        sender: isCurrentUser ? "Moi" : sender,
        content: apiMessage.message,
        timestamp: new Date(apiMessage.date).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        reactions: Array.isArray(apiMessage.createdReaction) ? apiMessage.createdReaction.map((r: ApiReaction) => ({
            emoji: r.emoji,
            count: 1,
            users: [r.user.uuid],
        })) : [],
        attachments: [],
        avatar: null,
    };
};

export const useDirectMessage = (userId: string) => {
    // État local
    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserUuid, setCurrentUserUuid] = useState<UUID | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<boolean>(false); // Pour forcer le rafraîchissement
    
    // Utiliser useAuth pour récupérer l'utilisateur courant
    const { user: currentUser, token } = useAuth();
    
    // Récupérer l'UUID de l'utilisateur courant directement depuis l'objet currentUser
    useEffect(() => {
        if (currentUser && currentUser.uuid) {
            setCurrentUserUuid(currentUser.uuid as UUID);
            console.log("UUID de l'utilisateur courant (depuis currentUser):", currentUser.uuid);
        }
    }, [currentUser]);
    
    // S'assurer que le WebSocket est connecté
    useEffect(() => {
        if (token) {
            console.log("useDirectMessage - Initialisation de la connexion WebSocket");
            WebSocketService.connect(token)
                .then(() => console.log("useDirectMessage - WebSocket connecté avec succès"))
                .catch(err => console.error("useDirectMessage - Erreur de connexion WebSocket:", err));
        }
        
        return () => {
            // Ne pas déconnecter le WebSocket ici pour maintenir la connexion entre les écrans
        };
    }, [token]);
    
    console.log("useDirectMessage - userId reçu:", userId);
    console.log("useDirectMessage - Utilisateur courant:", currentUser);
    console.log("useDirectMessage - UUID utilisateur courant (de useAuth):", currentUserUuid);
    
    // Récupérer les données de l'utilisateur destinataire
    useEffect(() => {
        const fetchRecipientUser = async () => {
            if (!userId) {
                console.error("useDirectMessage - Aucun userId fourni pour récupérer l'utilisateur destinataire");
                setError("Identifiant utilisateur manquant");
                return;
            }
            
            console.log("useDirectMessage - Récupération du destinataire avec ID:", userId);
            
            try {
                setLoading(true);
                // S'assurer que l'UUID est correctement formaté
                const recipientId = userId as UUID;
                
                // Utiliser directement getUserById pour récupérer les informations du destinataire
                const recipientData = await userService.getUserById(recipientId);
                console.log("useDirectMessage - Données du destinataire récupérées:", recipientData);
                
                // Créer l'objet utilisateur pour le destinataire
                const newUser = {
                    uuid: recipientData.uuid as UUID,
                    name: recipientData.fullName || recipientData.username,
                    username: recipientData.username,
                    email: recipientData.email,
                    status: recipientData.status || "hors ligne",
                    avatar: recipientData.avatar || null,
                };
                
                console.log("useDirectMessage - Utilisateur destinataire créé:", newUser);
                setUser(newUser);
                
                setError(null);
            } catch (error) {
                console.error("Erreur lors de la récupération du destinataire:", error);
                setError("Impossible de récupérer les informations du destinataire");
            } finally {
                setLoading(false);
            }
        };
        
        fetchRecipientUser();
    }, [userId]);
    
    // Effet pour surveiller les changements d'utilisateur destinataire
    useEffect(() => {
        if (user) {
            console.log("useDirectMessage - Utilisateur destinataire mis à jour:", user);
        }
    }, [user]);
    
    // Effet pour surveiller l'utilisateur courant
    useEffect(() => {
        console.log("useDirectMessage - Utilisateur courant:", currentUser);
        console.log("useDirectMessage - UUID utilisateur courant:", currentUserUuid);
    }, [currentUser, currentUserUuid]);
    
    // Récupérer les messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!userId) {
                console.error("useDirectMessage - Aucun userId fourni pour récupérer les messages");
                return;
            }
            
            // Vérifier si l'utilisateur courant est disponible via useAuth
            if (!currentUser || !currentUserUuid) {
                console.error("useDirectMessage - Utilisateur courant non disponible pour récupérer les messages");
                setError("Utilisateur non authentifié");
                return;
            }
            
            console.log("useDirectMessage - Récupération des messages entre", currentUser.username, "(UUID:", currentUserUuid, ") et utilisateur", userId);
            
            try {
                setLoading(true);
                // Utiliser la nouvelle API pour récupérer les messages privés
                const recipientId = userId as UUID;
                console.log("useDirectMessage - Appel API getDirectMessages avec ID destinataire:", recipientId);
                
                // Récupérer les messages reçus par l'utilisateur destinataire
                const receivedMessages = await messageService.getDirectMessages(recipientId);
                console.log("useDirectMessage - Messages reçus par le destinataire:", receivedMessages);
                
                // Si l'utilisateur courant est disponible, récupérer également ses messages reçus
                let sentMessages: any[] = [];
                if (currentUserUuid) {
                    try {
                        sentMessages = await messageService.getDirectMessages(currentUserUuid as UUID);
                        console.log("useDirectMessage - Messages reçus par l'utilisateur courant:", sentMessages);
                    } catch (error) {
                        console.error("Erreur lors de la récupération des messages de l'utilisateur courant:", error);
                    }
                }
                
                // Combiner les deux ensembles de messages
                // Filtrer pour ne garder que les messages entre les deux utilisateurs
                const allMessages = [...receivedMessages, ...sentMessages].filter(msg => {
                    // Vérifier si le message est entre l'utilisateur courant et le destinataire
                    const sourceId = typeof msg.source === 'string' ? msg.source : msg.source.uuid;
                    const destId = typeof msg.destination_user === 'string' ? msg.destination_user : msg.destination_user?.uuid;
                    
                    return (sourceId === currentUserUuid && destId === recipientId) || 
                           (sourceId === recipientId && destId === currentUserUuid);
                });
                
                // Trier les messages par date
                const messagesData = allMessages.sort((a, b) => 
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                
                console.log("useDirectMessage - Messages combinés et filtrés:", messagesData);
                
                const convertedMessages = messagesData.map(msg => 
                    convertApiMessageToUiMessage(msg, currentUserUuid)
                );
                
                console.log("useDirectMessage - Messages convertis pour l'UI:", convertedMessages);
                setMessages(convertedMessages);
                setError(null);
            } catch (error) {
                console.error("Erreur lors de la récupération des messages:", error);
                setError("Impossible de récupérer les messages");
            } finally {
                setLoading(false);
            }
        };
        
        fetchMessages();
        
        // Configurer WebSocket pour les messages en temps réel
        console.log("Configuration des écouteurs WebSocket dans useDirectMessage");
        
        if (!WebSocketService.isConnected()) {
            console.log("WebSocket non connecté, tentative de connexion...");
            if (token) {
                WebSocketService.connect(token)
                    .then(() => console.log("WebSocket connecté avec succès"))
                    .catch(err => console.error("Erreur de connexion WebSocket:", err));
            }
        } else {
            console.log("WebSocket déjà connecté");
        }
        
        // Ajouter les écouteurs d'événements WebSocket
        WebSocketService.on("message", handleNewMessage);
        WebSocketService.on("message_sent", handleNewMessage);
        WebSocketService.on("message.created", handleNewMessage);
        
        // Ajouter des écouteurs directs sur la socket pour déboguer
        const messageHandler = (data: any) => {
            console.log("WebSocket - Événement 'message' reçu directement:", JSON.stringify(data));
            handleNewMessage(data);
        };
        
        const messageCreatedHandler = (data: any) => {
            console.log("WebSocket - Événement 'message.created' reçu directement:", JSON.stringify(data));
            handleNewMessage(data);
        };
        
        WebSocketService.addSocketListener("message", messageHandler);
        WebSocketService.addSocketListener("message.created", messageCreatedHandler);
        
        return () => {
            // Nettoyer les écouteurs lors du démontage du composant
            WebSocketService.off("message", handleNewMessage);
            WebSocketService.off("message_sent", handleNewMessage);
            WebSocketService.off("message.created", handleNewMessage);
            WebSocketService.removeSocketListener("message", messageHandler);
            WebSocketService.removeSocketListener("message.created", messageCreatedHandler);
        };
    }, [userId, currentUserUuid]);
    
    // Gérer les nouveaux messages reçus via WebSocket
    const handleNewMessage = useCallback((data: any) => {
        console.log("WebSocket - Message reçu dans useDirectMessage:", JSON.stringify(data));
        
        // Extraire le message selon différents formats possibles
        let message: any;
        
        if (data.data) {
            // Format: { data: { ... } }
            message = data.data;
        } else if (data.message === 'message.created' && data.payload) {
            // Format: { message: 'message.created', payload: { ... } }
            message = data.payload;
        } else if (data.uuid) {
            // Format: le message est directement l'objet data
            message = data;
        } else {
            console.log("WebSocket - Format de message non reconnu:", JSON.stringify(data));
            return;
        }
        
        // Vérifier si le message a une structure valide
        if (!message || !message.uuid) {
            console.log("WebSocket - Message invalide ou sans UUID, ignoré");
            return;
        }
        
        console.log("WebSocket - Message formaté:", JSON.stringify(message));
        
        // Extraire les UUIDs de source et destination pour une comparaison plus simple
        let sourceUuid: string | undefined;
        let destUuid: string | undefined;
        
        // Extraire l'UUID source
        if (typeof message.source === 'string') {
            sourceUuid = message.source;
        } else if (message.source && message.source.uuid) {
            sourceUuid = message.source.uuid;
        }
        
        // Extraire l'UUID destination
        if (typeof message.destination_user === 'string') {
            destUuid = message.destination_user;
        } else if (message.destination_user && message.destination_user.uuid) {
            destUuid = message.destination_user.uuid;
        }
        
        console.log("WebSocket - sourceUuid:", sourceUuid);
        console.log("WebSocket - destUuid:", destUuid);
        console.log("WebSocket - currentUserUuid:", currentUserUuid);
        console.log("WebSocket - userId:", userId);
        
        // Vérifier si le message est pour cette conversation
        const isForThisConversation = (
            // Message envoyé par l'utilisateur courant à ce destinataire
            (sourceUuid === currentUserUuid && destUuid === userId) ||
            // Message reçu de ce destinataire
            (sourceUuid === userId && destUuid === currentUserUuid)
        );
        
        console.log("WebSocket - isForThisConversation:", isForThisConversation);
        
        if (isForThisConversation) {
            console.log("WebSocket - Message pour cette conversation!");
            
            // Vérifier si le message existe déjà pour éviter les doublons
            setMessages(prevMessages => {
                // Vérifier si le message existe déjà
                const messageExists = prevMessages.some(msg => msg.id === message.uuid);
                console.log("WebSocket - Le message existe déjà?", messageExists);
                if (messageExists) {
                    console.log("WebSocket - Message déjà existant, pas d'ajout");
                    return prevMessages;
                }
                
                // Convertir le message API en message UI
                const uiMessage = convertApiMessageToUiMessage(message, currentUserUuid);
                console.log("WebSocket - Nouveau message ajouté:", JSON.stringify(uiMessage));
                
                // Créer une nouvelle liste avec le message ajouté
                return [...prevMessages, uiMessage];
            });
            
            // Forcer un rafraîchissement de l'interface
            setTimeout(() => {
                console.log("WebSocket - Forçage du rafraîchissement de l'interface");
                setRefreshTrigger(prev => !prev);
                
                // Afficher le nombre de messages après l'ajout
                console.log("WebSocket - Nombre de messages après ajout:", messages.length + 1);
            }, 50);
        } else {
            console.log("WebSocket - Message ignoré (pas pour cette conversation)");
        }
    }, [userId, currentUserUuid]);
    
    // Gérer les confirmations d'envoi de message
    const handleMessageSent = useCallback((data: any) => {
        console.log("WebSocket - Message envoyé confirmé:", data);
        
        // Mettre à jour le statut du message dans l'UI si nécessaire
        if (data.message && data.status === "delivered") {
            // On pourrait ajouter un indicateur de statut aux messages
            // Pour l'instant, on se contente de logger la confirmation
        }
    }, []);
    
    // Envoyer un message
    const handleSendMessage = async (
        content: string,
        attachments: Attachment[] = [],
    ) => {
        if (!content.trim() && attachments.length === 0) {
            console.log("useDirectMessage - Tentative d'envoi d'un message vide, annulé");
            return;
        }
        
        console.log("useDirectMessage - Tentative d'envoi de message à l'utilisateur:", userId);
        
        // Vérifier si l'utilisateur courant est disponible via useAuth
        if (!currentUser || !currentUserUuid) {
            console.error("useDirectMessage - Impossible d'envoyer le message: utilisateur courant non identifié");
            alert("Impossible d'envoyer le message: veuillez vous reconnecter et réessayer.");
            return;
        }
        
        if (!userId) {
            console.error("useDirectMessage - Impossible d'envoyer le message: destinataire non identifié");
            alert("Impossible d'envoyer le message: destinataire non identifié.");
            return;
        }
        
        // Créer le message optimiste pour l'UI
        const tempId = `temp-${Date.now()}`;
        console.log("useDirectMessage - Création d'un message optimiste avec ID temporaire:", tempId);
        
        const optimisticMessage: Message = {
            id: tempId,
            sender: "Moi",
            content,
            timestamp: new Date().toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            }),
            reactions: [],
            attachments,
            avatar: null,
        };
        
        // Ajouter immédiatement à l'UI
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        
        try {
            // Préparer les données pour l'API
            // S'assurer que les UUIDs sont correctement formatés
            const recipientId = userId as UUID;
            
            // Utiliser l'UUID de l'utilisateur courant
            const sourceUuid = currentUserUuid;
            
            // Fonction pour vérifier si une chaîne est un UUID valide
            const isValidUUID = (uuid: string): boolean => {
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                return uuidRegex.test(uuid);
            };
            
            // Vérifier que l'utilisateur courant a un ID valide
            if (!sourceUuid || typeof sourceUuid !== 'string') {
                console.error("useDirectMessage - Aucun ID utilisateur valide disponible:", { currentUserUuid });
                throw new Error("Impossible d'identifier l'utilisateur courant");
            }
            
            // Vérifier que le destinataire a un UUID valide
            if (!recipientId || typeof recipientId !== 'string') {
                console.error("useDirectMessage - UUID du destinataire invalide:", recipientId);
                throw new Error("UUID du destinataire invalide");
            }
            
            console.log("useDirectMessage - Préparation de l'envoi du message:");
            console.log("- De l'utilisateur (source_uuid):", sourceUuid);
            console.log("- Au destinataire (destination_uuid):", recipientId);
            
            // Convertir les chaînes en UUID valides pour TypeScript
            // Si les chaînes ne sont pas des UUID valides, cela échouera côté serveur
            let formattedSourceUuid: UUID;
            let formattedDestinationUuid: UUID;
            
            // Vérifier et formater l'UUID source
            if (isValidUUID(sourceUuid)) {
                formattedSourceUuid = sourceUuid as UUID;
            } else {
                console.warn("useDirectMessage - sourceUuid n'est pas un UUID valide, utilisation telle quelle");
                formattedSourceUuid = sourceUuid as unknown as UUID;
            }
            
            // Vérifier et formater l'UUID destination
            if (isValidUUID(recipientId)) {
                formattedDestinationUuid = recipientId;
            } else {
                console.warn("useDirectMessage - recipientId n'est pas un UUID valide, utilisation telle quelle");
                formattedDestinationUuid = recipientId as unknown as UUID;
            }
            
            console.log("useDirectMessage - UUIDs formatés:", {
                source: formattedSourceUuid,
                destination: formattedDestinationUuid
            });
            
            const messageData = {
                message: content,
                source_uuid: formattedSourceUuid,
                destination_uuid: formattedDestinationUuid,
                is_public: false
            };
            
            console.log("useDirectMessage - Données du message à envoyer:", JSON.stringify(messageData, null, 2));
            
            // Vérifier une dernière fois que les UUIDs sont valides
            if (!formattedSourceUuid || !formattedDestinationUuid) {
                throw new Error("Les UUIDs source ou destination sont invalides");
            }
            
            // Utiliser la nouvelle API avec le format users/recepteurId/messages
            console.log(`useDirectMessage - Appel API POST /users/${recipientId}/messages`);
            const response = await messageService.sendDirectMessage(formattedDestinationUuid, messageData);
            
            console.log("useDirectMessage - Message envoyé avec succès, réponse:", response);
            
            // Remplacer le message optimiste par la réponse réelle
            setMessages(prevMessages => 
                prevMessages.map(msg => 
                    msg.id === tempId ? convertApiMessageToUiMessage(response, currentUserUuid) : msg
                )
            );
            
            return convertApiMessageToUiMessage(response, currentUserUuid);
        } catch (error: any) {
            console.error("useDirectMessage - Erreur lors de l'envoi du message:", error);
            
            // Extraire et afficher les détails de l'erreur
            if (error.response) {
                // Erreur de réponse du serveur
                console.error("useDirectMessage - Détails de l'erreur serveur:", {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            } else if (error.request) {
                // Erreur de requête (pas de réponse reçue)
                console.error("useDirectMessage - Erreur de requête (pas de réponse):", error.request);
            } else {
                // Autre type d'erreur
                console.error("useDirectMessage - Message d'erreur:", error.message);
            }
            
            // Supprimer le message optimiste en cas d'erreur
            setMessages(prevMessages => 
                prevMessages.filter(msg => msg.id !== tempId)
            );
            
            // Définir un message d'erreur plus descriptif
            setError("Erreur lors de l'envoi du message. Vérifiez les logs pour plus de détails.");
            
            // Afficher une erreur à l'utilisateur
            alert("Impossible d'envoyer le message. Veuillez réessayer.");
            
            throw error;
        }
    };

    // Ajouter une réaction à un message
    const handleAddReaction = async (messageId: string, emoji: string) => {
        if (!currentUserUuid) {
            console.error("Impossible d'ajouter une réaction: utilisateur non identifié");
            return;
        }
        
        try {
            // Optimistic update
            const updatedMessages = messages.map((msg) => {
                if (msg.id === messageId) {
                    const existingReactionIndex = msg.reactions.findIndex(
                        (r) => r.emoji === emoji,
                    );

                    if (existingReactionIndex >= 0) {
                        // La réaction existe déjà, incrémenter le compteur
                        const updatedReactions = [...msg.reactions];
                        updatedReactions[existingReactionIndex] = {
                            ...updatedReactions[existingReactionIndex],
                            count:
                                updatedReactions[existingReactionIndex].count + 1,
                            users: [
                                ...updatedReactions[existingReactionIndex].users,
                                currentUserUuid,
                            ],
                        };

                        return { ...msg, reactions: updatedReactions };
                    } else {
                        // Nouvelle réaction
                        return {
                            ...msg,
                            reactions: [
                                ...msg.reactions,
                                { emoji, count: 1, users: [currentUserUuid] },
                            ],
                        };
                    }
                }
                return msg;
            });

            setMessages(updatedMessages);
            
            // Appel API pour ajouter la réaction
            // Note: Cette partie doit être implémentée lorsque l'API de réactions sera disponible
            // await messageService.addReaction(messageId, emoji, currentUserUuid);
        } catch (error) {
            console.error("Erreur lors de l'ajout de la réaction:", error);
            // Rollback en cas d'erreur
            // Recharger les messages depuis l'API
        }
    };

    // Supprimer une réaction d'un message
    const handleRemoveReaction = async (messageId: string, emoji: string) => {
        if (!currentUserUuid) {
            console.error("Impossible de supprimer une réaction: utilisateur non identifié");
            return;
        }
        
        try {
            // Optimistic update
            const updatedMessages = messages.map((msg) => {
                if (msg.id === messageId) {
                    const existingReactionIndex = msg.reactions.findIndex(
                        (r) => r.emoji === emoji,
                    );

                    if (existingReactionIndex >= 0) {
                        const reaction = msg.reactions[existingReactionIndex];

                        if (reaction.count > 1) {
                            // Décrémenter le compteur
                            const updatedReactions = [...msg.reactions];
                            updatedReactions[existingReactionIndex] = {
                                ...reaction,
                                count: reaction.count - 1,
                                users: reaction.users.filter(
                                    (u) => u !== currentUserUuid,
                                ),
                            };

                            return { ...msg, reactions: updatedReactions };
                        } else {
                            // Supprimer la réaction
                            return {
                                ...msg,
                                reactions: msg.reactions.filter(
                                    (_, index) => index !== existingReactionIndex,
                                ),
                            };
                        }
                    }
                }
                return msg;
            });

            setMessages(updatedMessages);
            
            // Appel API pour supprimer la réaction
            // Note: Cette partie doit être implémentée lorsque l'API de réactions sera disponible
            // await messageService.removeReaction(messageId, emoji, currentUserUuid);
        } catch (error) {
            console.error("Erreur lors de la suppression de la réaction:", error);
            // Rollback en cas d'erreur
            // Recharger les messages depuis l'API
        }
    };

    // Effet pour déboguer les changements d'état
    useEffect(() => {
        console.log("useDirectMessage - État refreshTrigger changé:", refreshTrigger);
        console.log("useDirectMessage - Nombre de messages actuel:", messages.length);
    }, [refreshTrigger, messages.length]);
    
    return {
        user,
        messages,
        loading,
        error,
        currentUserUuid,
        handleSendMessage,
        handleAddReaction,
        handleRemoveReaction,
        refreshTrigger, // Exposer le déclencheur de rafraîchissement
    };
};

export default useDirectMessage;
