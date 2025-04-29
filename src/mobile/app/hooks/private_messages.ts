import { useState } from "react";
import {
    Message,
    Attachment,
    Users,
    Conversations,
} from "../services/private_messages";

// Données d'exemple pour les utilisateurs - dans une vraie application, cela viendrait d'une API
const SAMPLE_USERS: Users = {
    dm1: { id: "dm1", name: "Sophie Martin", status: "en ligne", avatar: null },
    dm2: { id: "dm2", name: "Thomas Bernard", status: "absent", avatar: null },
    dm3: { id: "dm3", name: "Julie Dubois", status: "en ligne", avatar: null },
    dm4: { id: "dm4", name: "Marc Petit", status: "hors ligne", avatar: null },
};

// Données d'exemple pour les conversations directes
const SAMPLE_CONVERSATIONS: Conversations = {
    dm1: [
        {
            id: "m1",
            sender: "Sophie Martin",
            content: "Bonjour ! Comment avance le projet marketing ?",
            timestamp: "10:30",
            reactions: [
                { emoji: "👍", count: 3, users: ["user1", "user2", "user3"] },
            ],
            attachments: [],
            avatar: null,
        },
        {
            id: "m2",
            sender: "Moi",
            content:
                "Salut Sophie ! Ça avance bien, je viens de terminer la maquette.",
            timestamp: "10:32",
            reactions: [],
            attachments: [],
            avatar: null,
        },
        {
            id: "m3",
            sender: "Sophie Martin",
            content:
                "Super ! Tu peux me l'envoyer pour que je puisse y jeter un œil ?",
            timestamp: "10:35",
            reactions: [],
            attachments: [],
            avatar: null,
        },
    ],
    dm2: [
        {
            id: "m1",
            sender: "Thomas Bernard",
            content: "As-tu reçu mon email concernant la réunion de demain ?",
            timestamp: "09:15",
            reactions: [],
            attachments: [],
            avatar: null,
        },
        {
            id: "m2",
            sender: "Moi",
            content: "Oui, je l'ai bien reçu. Je serai présent.",
            timestamp: "09:20",
            reactions: [],
            attachments: [],
            avatar: null,
        },
    ],
    dm3: [
        {
            id: "m1",
            sender: "Julie Dubois",
            content:
                "Bonjour, pourrais-tu m'aider avec le rapport trimestriel ?",
            timestamp: "14:05",
            reactions: [],
            attachments: [],
            avatar: null,
        },
    ],
    dm4: [
        {
            id: "m1",
            sender: "Moi",
            content: "Salut Marc, as-tu des nouvelles du client ?",
            timestamp: "11:45",
            reactions: [],
            attachments: [],
            avatar: null,
        },
    ],
};

export const useDirectMessage = (userId: string) => {
    // Récupérer les messages pour cet utilisateur
    const [messages, setMessages] = useState<Message[]>(
        SAMPLE_CONVERSATIONS[userId as keyof typeof SAMPLE_CONVERSATIONS] || [],
    );

    // Récupérer les données de l'utilisateur
    const user = SAMPLE_USERS[userId as keyof typeof SAMPLE_USERS];

    // Envoyer un message
    const handleSendMessage = (
        content: string,
        attachments: Attachment[] = [],
    ) => {
        if (!content.trim() && attachments.length === 0) return;

        const newMessage: Message = {
            id: `m${messages.length + 1}`,
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

        setMessages([...messages, newMessage]);

        // Dans une vraie application, on enverrait le message à l'API
        console.log("Sending message to", user?.name, ":", content);
    };

    // Ajouter une réaction à un message
    const handleAddReaction = (messageId: string, emoji: string) => {
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
    };

    // Supprimer une réaction d'un message
    const handleRemoveReaction = (messageId: string, emoji: string) => {
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
                                (u) => u !== "currentUser",
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
    };

    return {
        user,
        messages,
        handleSendMessage,
        handleAddReaction,
        handleRemoveReaction,
    };
};

export default useDirectMessage;
