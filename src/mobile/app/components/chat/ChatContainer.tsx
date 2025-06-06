import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Text,
    Modal,
    TouchableOpacity,
} from "react-native";
import { UUID } from "crypto";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import EmojiPicker from "./EmojiPicker";
import useMessages from "../../hooks/useMessages";
import useReactions from "../../hooks/useReactions";
import useAttachments from "../../hooks/useAttachments";
import {
    Message as ApiMessage,
    Reaction as ApiReaction,
} from "../../services/api/endpoints/messages";
import { Attachment as ApiAttachment } from "../../services/api/endpoints/attachments";
import websocketService from "../../services/websocket/websocket.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type pour les réactions regroupées dans l'UI (nécessaire pour l'affichage)
type UIReaction = {
    emoji: string;
    count: number;
    users: string[];
};

interface ChatContainerProps {
    workspaceUuid: UUID | null;
    userUuid: UUID;
    channelUuid: UUID;
    channelName?: string;
    currentUser: string;
    initialMessages?: ApiMessage[];
    onSendMessage?: (content: string) => Promise<any>;
    onAddReaction?: (messageId: UUID, emoji: string) => Promise<void>;
    onDeleteMessage?: (messageId: UUID) => void;
    onPinMessage?: (messageId: UUID) => void;
}

const ChatContainer: React.FC<ChatContainerProps> = ({
    workspaceUuid,
    userUuid,
    channelUuid,
    channelName,
    currentUser,
    initialMessages = [],
    onSendMessage: externalSendMessage,
    onAddReaction: externalAddReaction,
    onDeleteMessage,
    onPinMessage,
}) => {
    // État pour le sélecteur d'emoji
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
    // Utilisation des hooks personnalisés
    console.log("ChatContainer - Appel de useMessages avec params:", {
        workspaceUuid,
        channelUuid,
        userUuid,
    });
    const {
        messages: apiMessages,
        loading: messagesLoading,
        error: messagesError,
        fetchMessages,
        sendMessage: apiSendMessage,
        editMessage: apiEditMessage,
        deleteMessage: apiDeleteMessage,
    } = useMessages(workspaceUuid, channelUuid, userUuid, userUuid); // Passer userUuid comme currentUserUuid

    // État local pour les messages
    const [uiMessages, setUiMessages] = useState<ApiMessage[]>(
        initialMessages || [],
    );
    const [activeMessageId, setActiveMessageId] = useState<UUID | null>(null);
    const [replyToMessageId, setReplyToMessageId] = useState<UUID | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editMessageContent, setEditMessageContent] = useState<string>("");
    const flatListRef = useRef<FlatList>(null);

    // Hook pour les réactions (utilisé quand un message est sélectionné)
    const {
        addReaction: apiAddReaction,
        removeReaction: apiRemoveReaction,
        hasUserReacted,
        getUserReaction,
        getUniqueEmojis,
        getReactionCount
    } = useReactions(
        workspaceUuid,
        channelUuid,
        activeMessageId as UUID,
        userUuid,
    );

    // Hook pour les pièces jointes
    const { pickFile, uploadAndAttachFile, downloadFile } = useAttachments(
        workspaceUuid,
        channelUuid,
        null,
        userUuid,
    );

    // Charger les messages au montage du composant
    useEffect(() => {
        // Charger les messages
        fetchMessages().catch((err) =>
            console.error(
                "ChatContainer - Erreur lors du chargement des messages:",
                err,
            ),
        );
    }, [fetchMessages]);

    // Vérifier l'état de la connexion WebSocket
    const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(
        websocketService.isConnected(),
    );

    // Surveiller l'état de la connexion WebSocket
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const connected = websocketService.isConnected();
            if (connected !== isWebSocketConnected) {
                setIsWebSocketConnected(connected);

                // Si la connexion vient d'être rétablie, recharger les messages
                // pour synchroniser avec les derniers messages du serveur
                if (connected && !isWebSocketConnected) {
                    fetchMessages().catch((err) =>
                        console.error(
                            "Erreur lors de la synchronisation des messages après reconnexion:",
                            err,
                        ),
                    );
                }
            }
        }, 3000);

        return () => clearInterval(checkInterval);
    }, [isWebSocketConnected, fetchMessages]);

    useEffect(() => {
        if (!channelUuid) {
            return;
        }
        // Événements de messages
        const onMessageReceived = websocketService.on(
            "message_sent",
            (data) => {
                console.log("ChatContainer - message_sent reçu:", data);
                // Vérifier si le message appartient au canal actuel
                const isForCurrentChannel =
                    (data.destination_channel &&
                        data.destination_channel.uuid === channelUuid) ||
                    (data.channel && data.channel.uuid === channelUuid);

                if (isForCurrentChannel) {
                    console.log(
                        "ChatContainer - Message pour ce canal, mise à jour",
                    );
                    // Ajouter directement le message à l'UI au lieu de recharger tous les messages
                    // Cela permet une mise à jour plus rapide et plus fluide
                    const messageData = data.data ? data.data : data;
                    const messageExists = uiMessages.some(
                        (msg) => msg.uuid === messageData.uuid,
                    );

                    if (!messageExists) {
                        setUiMessages((prev) => [...prev, messageData]);
                    } else {
                        console.log(
                            "ChatContainer - Message déjà présent dans l'UI",
                        );
                    }
                }
            },
        );

        // Écouter aussi l'événement message.created du backend
        const onMessageCreated = websocketService.on(
            "message.created",
            (data) => {
                console.log(
                    "ChatContainer - message.created reçu:",
                    JSON.stringify(data),
                );
                // Traiter de la même manière que message_sent
                const messageData = data.data ? data.data : data;
                console.log(
                    "ChatContainer - messageData formaté:",
                    JSON.stringify(messageData),
                );

                // Vérifier si c'est un message privé (destination_user plutôt que destination_channel)
                const isPrivateMessage =
                    messageData.destination_user !== null &&
                    messageData.destination_user !== undefined;
                console.log(
                    "ChatContainer - Est un message privé:",
                    isPrivateMessage,
                );

                // Extraire les UUIDs pour faciliter la comparaison
                let sourceUuid =
                    typeof messageData.source === "string"
                        ? messageData.source
                        : messageData.source?.uuid;

                let destUuid =
                    typeof messageData.destination_user === "string"
                        ? messageData.destination_user
                        : messageData.destination_user?.uuid;

                console.log("ChatContainer - sourceUuid:", sourceUuid);
                console.log("ChatContainer - destUuid:", destUuid);
                console.log("ChatContainer - userUuid:", userUuid);
                console.log("ChatContainer - channelUuid:", channelUuid);

                // Vérifier si le message est pour le canal actuel
                const isForCurrentChannel =
                    messageData.destination_channel &&
                    (typeof messageData.destination_channel === "string"
                        ? messageData.destination_channel === channelUuid
                        : messageData.destination_channel.uuid === channelUuid);

                // Vérifier si c'est un message privé pour cette conversation
                const isForCurrentPrivateChat =
                    isPrivateMessage &&
                    // Message envoyé par l'utilisateur courant au destinataire
                    ((sourceUuid === userUuid && destUuid === channelUuid) ||
                        // Message reçu du destinataire
                        (sourceUuid === channelUuid && destUuid === userUuid));

                console.log(
                    "ChatContainer - isForCurrentChannel:",
                    isForCurrentChannel,
                );
                console.log(
                    "ChatContainer - isForCurrentPrivateChat:",
                    isForCurrentPrivateChat,
                );

                if (isForCurrentChannel || isForCurrentPrivateChat) {
                    console.log(
                        "ChatContainer - Message pour cette conversation, ajout à l'UI",
                    );

                    // Vérifier si le message existe déjà
                    const messageExists = uiMessages.some(
                        (msg) => msg.uuid === messageData.uuid,
                    );
                    console.log(
                        "ChatContainer - Message existe déjà:",
                        messageExists,
                    );

                    if (!messageExists) {
                        console.log(
                            "ChatContainer - Ajout du nouveau message à l'UI",
                        );
                        setUiMessages((prev) => {
                            const newMessages = [...prev, messageData];
                            console.log(
                                "ChatContainer - Nombre de messages après ajout:",
                                newMessages.length,
                            );
                            return newMessages;
                        });
                    }
                } else {
                    console.log(
                        "ChatContainer - Message ignoré (pas pour cette conversation)",
                    );
                }
            },
        );

        const onMessageUpdated = websocketService.on(
            "message_updated",
            (data) => {
                // Vérifier si le message appartient au canal actuel
                const isForCurrentChannel =
                    (data.destination_channel &&
                        data.destination_channel.uuid === channelUuid) ||
                    (data.channel && data.channel.uuid === channelUuid);

                if (isForCurrentChannel) {
                    fetchMessages();
                }
            },
        );

        const onMessageRemoved = websocketService.on(
            "message_removed",
            (data) => {
                // Rafraîchir les messages pour mettre à jour l'UI
                fetchMessages();
            },
        );

        // Événements de réactions
        const onReactionReceived = websocketService.on(
            "reaction_added",
            (data) => {
                // Vérifier si la réaction concerne un message du canal actuel
                if (
                    data.message &&
                    uiMessages.some((msg) => msg.uuid === data.message.uuid)
                ) {
                    fetchMessages();
                }
            },
        );

        const onReactionRemoved = websocketService.on(
            "reaction_removed",
            (data) => {
                // Vérifier si la réaction concerne un message du canal actuel
                if (
                    data.message &&
                    uiMessages.some((msg) => msg.uuid === data.message.uuid)
                ) {
                    fetchMessages();
                }
            },
        );

        // Nettoyage lors du démontage
        return () => {
            websocketService.off("message_sent", onMessageReceived);
            websocketService.off("message.created", onMessageCreated);
            websocketService.off("reaction_added", onReactionReceived);
            websocketService.off("reaction_removed", onReactionRemoved);
        };
    }, [channelUuid, fetchMessages, uiMessages]);

    // Mettre à jour les messages de l'UI quand les messages API changent
    useEffect(() => {
        if (apiMessages && apiMessages.length > 0) {
            console.log(
                "ChatContainer - Mise à jour des messages UI depuis API:",
                apiMessages.length,
            );
            console.log(
                "ChatContainer - Premier message API:",
                JSON.stringify(apiMessages[0]),
            );
            console.log(
                "ChatContainer - Dernier message API:",
                JSON.stringify(apiMessages[apiMessages.length - 1]),
            );

            // Fusionner les messages API avec les messages UI existants
            // pour éviter de perdre les messages reçus via WebSocket
            setUiMessages((prev) => {
                console.log(
                    "ChatContainer - Messages UI existants:",
                    prev.length,
                );
                if (prev.length > 0) {
                    console.log(
                        "ChatContainer - Premier message UI existant:",
                        JSON.stringify(prev[0]),
                    );
                    console.log(
                        "ChatContainer - Dernier message UI existant:",
                        JSON.stringify(prev[prev.length - 1]),
                    );
                }

                // Créer un ensemble des UUID des messages existants
                const existingIds = new Set(prev.map((msg) => msg.uuid));
                console.log(
                    "ChatContainer - IDs existants:",
                    Array.from(existingIds),
                );

                // Filtrer les nouveaux messages qui ne sont pas déjà dans l'UI
                const newMessages = apiMessages.filter(
                    (msg) => !existingIds.has(msg.uuid),
                );

                if (newMessages.length > 0) {
                    // Trier les messages par date
                    const combinedMessages = [...prev, ...newMessages].sort(
                        (a, b) =>
                            new Date(a.date).getTime() -
                            new Date(b.date).getTime(),
                    );

                    return combinedMessages;
                }

                // Si aucun nouveau message, remplacer complètement pour s'assurer que l'ordre est correct
                // Mais d'abord, trier les messages par date
                const sortedMessages = [...apiMessages].sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                );

                return sortedMessages;
            });
        } else {
            console.log("ChatContainer - Pas de messages API à afficher");
        }
    }, [apiMessages]);

    // Gérer les messages initiaux
    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            console.log(
                "ChatContainer - Initialisation avec des messages existants:",
                initialMessages.length,
            );
            console.log(
                "ChatContainer - Premier message:",
                JSON.stringify(initialMessages[0]),
            );
            console.log(
                "ChatContainer - Dernier message:",
                JSON.stringify(initialMessages[initialMessages.length - 1]),
            );
            setUiMessages(initialMessages);
        }
    }, [initialMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        console.log(
            "ChatContainer - Messages UI mis à jour, nombre de messages:",
            uiMessages.length,
        );
        if (uiMessages.length > 0) {
            console.log(
                "ChatContainer - Dernier message UI:",
                JSON.stringify(uiMessages[uiMessages.length - 1]),
            );
        }

        if (flatListRef.current && uiMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
                console.log("ChatContainer - Scroll to end exécuté");
            }, 100);
        }
    }, [uiMessages]);

    // Fonction pour envoyer un message
    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        try {
            console.log("ChatContainer - Envoi d'un message:", content);

            // Créer un message temporaire pour affichage immédiat
            const tempMessage: ApiMessage = {
                uuid: `temp-${Date.now()}` as UUID,
                message: content,
                is_public: workspaceUuid !== null,
                date: new Date().toISOString(),
                source: {
                    uuid: userUuid,
                    username: currentUser,
                },
                destination_channel: workspaceUuid
                    ? { uuid: channelUuid }
                    : null,
                destination_user: !workspaceUuid ? { uuid: channelUuid } : null,
                createdReaction: [],
            };

            // Ajouter le message temporaire à l'UI pour feedback immédiat
            setUiMessages((prev) => [...prev, tempMessage]);
            console.log("ChatContainer - Message temporaire ajouté à l'UI");

            // Si une fonction d'envoi externe est fournie, l'utiliser
            if (externalSendMessage) {
                console.log(
                    "ChatContainer - Utilisation de la fonction d'envoi externe",
                );
                await externalSendMessage(content);
            } else {
                // Sinon, utiliser la fonction d'envoi de message du hook
                console.log("ChatContainer - Utilisation de apiSendMessage");
                await apiSendMessage(content);
            }

            console.log("ChatContainer - Message envoyé avec succès");

            // Rafraîchir les messages après l'envoi pour obtenir le vrai message
            // avec son UUID permanent du serveur
            setTimeout(() => {
                console.log(
                    "ChatContainer - Rafraîchissement des messages après envoi",
                );
                fetchMessages();
            }, 500); // Ajouter un délai pour laisser le temps au serveur de traiter le message
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            // Retirer le message temporaire en cas d'erreur
            setUiMessages((prev) =>
                prev.filter((msg) => !msg.uuid.toString().startsWith("temp-")),
            );
        }
    };

    // Handle adding or removing reaction to a message
    const handleAddReaction = useCallback(
        async (messageId: UUID, emoji: string) => {
            console.log(`ChatContainer - handleAddReaction - messageId: ${messageId}, emoji: ${emoji}`);
            setActiveMessageId(messageId);
            
            try {
                // Vérifier si l'utilisateur a déjà réagi avec cet emoji
                const existingReaction = getUserReaction(emoji);
                
                if (existingReaction) {
                    // Si l'utilisateur a déjà réagi avec cet emoji, on supprime la réaction
                    console.log(`ChatContainer - handleAddReaction - Suppression de la réaction existante: ${existingReaction.uuid}`);
                    await apiRemoveReaction(existingReaction.uuid);
                } else {
                    // Sinon, on ajoute la réaction
                    console.log(`ChatContainer - handleAddReaction - Ajout d'une nouvelle réaction: ${emoji}`);
                    await apiAddReaction(emoji);
                }
                
                // Le rafraîchissement des données se fera via WebSocket ou fetchMessages
                if (!isWebSocketConnected) {
                    await fetchMessages();
                }
            } catch (error) {
                console.error("Error managing reaction:", error);
                Alert.alert(
                    "Error",
                    "Failed to manage reaction. Please try again.",
                );
            }
        },
        [apiAddReaction, apiRemoveReaction, getUserReaction, fetchMessages, isWebSocketConnected],
    );

    // Handle replying to a message
    const handleReplyToMessage = useCallback((messageId: UUID) => {
        setReplyToMessageId(messageId);
    }, []);

    // Handle copying a message
    const handleCopyMessage = useCallback(
        (messageId: UUID) => {
            const messageToCopy = uiMessages.find((m) => m.uuid === messageId);
            if (messageToCopy) {
                // Dans une vraie application, on utiliserait Clipboard.setString(messageToCopy.message)
                // Afficher une notification de copie réussie
            }
        },
        [uiMessages],
    );

    // Gérer l'édition d'un message
    const handleEditMessage = useCallback(
        (messageId: UUID, newContent: string) => {
            if (!channelUuid || !newContent.trim()) return;

            apiEditMessage(messageId, newContent)
                .then(() => {
                    // Mettre à jour l'état local des messages
                    setUiMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.uuid === messageId
                                ? { ...msg, message: newContent }
                                : msg,
                        ),
                    );
                    // Reset editing state
                    setIsEditing(false);
                    setActiveMessageId(null);
                    setEditMessageContent("");
                })
                .catch((error) => {
                    console.error("Error editing message:", error);
                    Alert.alert(
                        "Error",
                        "Failed to edit message. Please try again.",
                    );
                });
        },
        [channelUuid, apiEditMessage],
    );

    // Find the reply message if there is one
    const replyMessage = replyToMessageId
        ? uiMessages.find((m) => m.uuid === replyToMessageId)
        : null;

    // Fonction pour gérer la suppression d'un message
    const handleDeleteMessage = useCallback(
        async (messageId: UUID) => {
            try {
                await apiDeleteMessage(messageId);
                // Le rafraîchissement des données se fera via WebSocket ou fetchMessages
                if (!isWebSocketConnected) {
                    await fetchMessages();
                }
            } catch (error) {
                console.error("Error deleting message:", error);
                Alert.alert(
                    "Error",
                    "Failed to delete message. Please try again.",
                );
            }
        },
        [apiDeleteMessage, fetchMessages, isWebSocketConnected],
    );

    // Fonction pour télécharger une pièce jointe
    const handleDownloadAttachment = useCallback(
        async (attachmentUuid: UUID, filename: string) => {
            try {
                const fileUri = await downloadFile(attachmentUuid, filename);
                if (fileUri) {
                }
            } catch (error) {
                console.error("Error downloading attachment:", error);
                Alert.alert(
                    "Error",
                    "Failed to download file. Please try again.",
                );
            }
        },
        [downloadFile],
    );

    // Fonction pour sélectionner un fichier à envoyer
    const handlePickFile = useCallback(async () => {
        try {
            const file = await pickFile();
            if (file) {
                // Convertir le fichier au format attendu par ChatInput
                // Créer une structure compatible avec ApiAttachment
                return {
                    uuid: crypto.randomUUID(), // Générer un UUID temporaire
                    filename: file.name || "",
                    mimetype: file.type || "",
                    size: file.size || 0,
                    url: file.uri || "",
                } as ApiAttachment;
            }
        } catch (error) {
            console.error("Error picking file:", error);
            Alert.alert("Error", "Failed to select file. Please try again.");
        }
        return null;
    }, [pickFile]);

    // Render a message with proper positioning based on sender
    const renderMessage = useCallback(
        ({ item }: { item: ApiMessage }) => {
            // Check if the message is from the current user
            const isCurrentUser =
                typeof item.source === "string"
                    ? userUuid === item.source
                    : userUuid === item.source?.uuid;

            return (
                <ChatMessage
                    message={item}
                    isCurrentUser={isCurrentUser}
                    workspaceUuid={workspaceUuid}
                    channelUuid={channelUuid}
                    userUuid={userUuid}
                    onAddReaction={(messageId, emoji) =>
                        handleAddReaction(messageId, emoji)
                    }
                    onShowEmojiPicker={() => {
                        setActiveMessageId(item.uuid);
                        setShowEmojiPicker(true);
                    }}
                    onDeleteMessage={(messageId) => handleDeleteMessage(messageId)}
                    onReplyToMessage={(messageId) => handleReplyToMessage(messageId)}
                    onCopyMessage={(messageId) => handleCopyMessage(messageId)}
                    onEditMessage={(messageId) => {
                        // Find the message content to edit
                        const messageToEdit = uiMessages.find(
                            (msg) => msg.uuid === messageId,
                        );
                        if (messageToEdit) {
                            setActiveMessageId(messageId);
                            setEditMessageContent(messageToEdit.message);
                            setIsEditing(true);
                            // Show an alert to edit the message
                            // Note: Alert.prompt is only available on iOS, using Alert.alert as a fallback
                            // In a real app, you would use a custom modal or input component
                            Alert.alert(
                                "Edit Message",
                                "Update your message:",
                                [
                                    {
                                        text: "Cancel",
                                        onPress: () => {
                                            setIsEditing(false);
                                            setActiveMessageId(null);
                                        },
                                        style: "cancel",
                                    },
                                    {
                                        text: "Save",
                                        onPress: () => {
                                            // In a real implementation, this would be a text input modal
                                            // For now, we'll just use the original message as a placeholder
                                            const updatedContent =
                                                messageToEdit.message +
                                                " (edited)";
                                            handleEditMessage(
                                                messageId,
                                                updatedContent,
                                            );
                                        },
                                    },
                                ],
                            );
                        }
                    }}
                    onPinMessage={(messageId) => {
                        // Implémentation du pin de message
                        Alert.alert(
                            "Pin Message",
                            "This feature is not yet implemented.",
                        );
                    }}
                />
            );
        },
        [
            handleAddReaction,
            handleDeleteMessage,
            handleReplyToMessage,
            handleCopyMessage,
            handleEditMessage,
            userUuid,
        ],
    );

    return (
        <View style={styles.container}>
            {/* Emoji Picker Modal */}
            {showEmojiPicker && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showEmojiPicker}
                    onRequestClose={() => setShowEmojiPicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setShowEmojiPicker(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.emojiPickerContainer}>
                                <EmojiPicker
                                    onEmojiSelected={(emoji: string) => {
                                        if (activeMessageId) {
                                            handleAddReaction(activeMessageId, emoji);
                                        }
                                        setShowEmojiPicker(false);
                                    }}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
            
            {/* Messages list */}
            {messagesLoading && uiMessages.length === 0 ? (
                <View style={[styles.container, styles.loadingContainer]}>
                    <Text style={styles.loadingText}>Loading messages...</Text>
                </View>
            ) : messagesError ? (
                <View style={[styles.container, styles.errorContainer]}>
                    <Text style={styles.errorText}>{messagesError}</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={uiMessages}
                    keyExtractor={(item) => item.uuid.toString()}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No messages yet
                            </Text>
                            <Text style={styles.emptySuggestion}>
                                Start the conversation!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Chat input */}
            <ChatInput
                channelName={channelName}
                placeholder="Type a message..."
                onSendMessage={handleSendMessage}
                onAddReaction={
                    replyMessage
                        ? (emoji) => handleAddReaction(replyMessage.uuid, emoji)
                        : undefined
                }
                replyMessage={replyMessage}
                onCancelReply={() => setReplyToMessageId(null)}
                onPickFile={handlePickFile}
                isOfflineMode={!isWebSocketConnected}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#36393f",
    },
    messagesList: {
        paddingHorizontal: 15,
        paddingBottom: 20,
        flexGrow: 1,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    emojiPickerContainer: {
        backgroundColor: "#2f3136",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: "hidden",
        maxHeight: 350,
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#dcddde",
        fontSize: 16,
    },
    errorContainer: {
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        color: "#f04747",
        fontSize: 16,
        textAlign: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    emptyText: {
        color: "#dcddde",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    emptySuggestion: {
        color: "#8e9297",
        fontSize: 14,
    },
});

export default ChatContainer;
