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
    externalFetchMessages?: () => Promise<void>;
    disableInternalFetchMessages?: boolean;
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
    externalFetchMessages,
    disableInternalFetchMessages = false,
}) => {

    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

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
    } = useMessages(workspaceUuid, channelUuid, userUuid, userUuid); 

    const [uiMessages, setUiMessages] = useState<ApiMessage[]>(
        initialMessages || [],
    );
    const [activeMessageId, setActiveMessageId] = useState<UUID | null>(null);
    const [replyToMessageId, setReplyToMessageId] = useState<UUID | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [editMessageContent, setEditMessageContent] = useState<string>("");
    const flatListRef = useRef<FlatList>(null);

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

    const { pickFile, uploadAndAttachFile, downloadFile } = useAttachments(
        workspaceUuid,
        channelUuid,
        null,
        userUuid,
    );

    useEffect(() => {
        if (disableInternalFetchMessages) {
            return;
        }
        
            const fetchFunc = externalFetchMessages || fetchMessages;
        
        fetchFunc().catch((err) =>
            console.error(
                "ChatContainer - Erreur lors du chargement des messages:",
                err,
            ),
        );
    }, [fetchMessages, externalFetchMessages, disableInternalFetchMessages]);

    const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(
        websocketService.isConnected(),
    );
    useEffect(() => {
        const checkInterval = setInterval(() => {
            const connected = websocketService.isConnected();
            if (connected !== isWebSocketConnected) {
                setIsWebSocketConnected(connected);

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
        const onMessageReceived = websocketService.on(
            "message_sent",
            (data) => {
                const isForCurrentChannel =
                    (data.destination_channel &&
                        data.destination_channel.uuid === channelUuid) ||
                    (data.channel && data.channel.uuid === channelUuid);

                if (isForCurrentChannel) {
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

        const onMessageCreated = websocketService.on(
            "message.created",
            (data) => {
                const messageData = data.data ? data.data : data;
                const isPrivateMessage =
                    messageData.destination_user !== null &&
                    messageData.destination_user !== undefined;
                    
                let sourceUuid =
                    typeof messageData.source === "string"
                        ? messageData.source
                        : messageData.source?.uuid;

                let destUuid =
                    typeof messageData.destination_user === "string"
                        ? messageData.destination_user
                        : messageData.destination_user?.uuid;
                        
                const isForCurrentChannel =
                    messageData.destination_channel &&
                    (typeof messageData.destination_channel === "string"
                        ? messageData.destination_channel === channelUuid
                        : messageData.destination_channel.uuid === channelUuid);

                const isForCurrentPrivateChat =
                    isPrivateMessage &&
                    ((sourceUuid === userUuid && destUuid === channelUuid) ||
                        (sourceUuid === channelUuid && destUuid === userUuid));

                if (isForCurrentChannel || isForCurrentPrivateChat) {
                    const messageExists = uiMessages.some(
                        (msg) => msg.uuid === messageData.uuid,
                    );

                    if (!messageExists) {
                        setUiMessages((prev) => {
                            const newMessages = [...prev, messageData];
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
                fetchMessages();
            },
        );

        const onReactionReceived = websocketService.on(
            "reaction_added",
            (data) => {
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
                if (
                    data.message &&
                    uiMessages.some((msg) => msg.uuid === data.message.uuid)
                ) {
                    fetchMessages();
                }
            },
        );

        return () => {
            websocketService.off("message_sent", onMessageReceived);
            websocketService.off("message.created", onMessageCreated);
            websocketService.off("reaction_added", onReactionReceived);
            websocketService.off("reaction_removed", onReactionRemoved);
        };
    }, [channelUuid, fetchMessages, uiMessages]);

    useEffect(() => {
        if (apiMessages && apiMessages.length > 0) {
            setUiMessages((prev) => {
                const validApiMessages = apiMessages.filter(msg => {
                    if (!msg.uuid) return false;
                    if (!msg.date || isNaN(new Date(msg.date).getTime())) {
                        msg.date = new Date().toISOString();
                    }
                    if (!msg.source) {
                        msg.source = {
                            uuid: userUuid,
                            username: "Utilisateur"
                        };
                    }
                    return true;
                });
                const tempMessageIds = new Set();
                const nonTempMessages = prev.filter(msg => {
                    if (!msg.uuid) return true; 
                    const msgId = typeof msg.uuid === 'string' ? msg.uuid : String(msg.uuid);
                    if (msgId.startsWith('temp-')) {
                        tempMessageIds.add(msg.message);
                        return false;
                    }
                    return true;
                });
                const existingIds = new Set();
                nonTempMessages.forEach(msg => {
                    if (msg.uuid) {
                        const msgId = typeof msg.uuid === 'string' ? msg.uuid : String(msg.uuid);
                        existingIds.add(msgId);
                    }
                });
                const newMessages = validApiMessages.filter(msg => {
                    if (!msg.uuid) return false;
                    const msgId = typeof msg.uuid === 'string' ? msg.uuid : String(msg.uuid);
                    if (!existingIds.has(msgId)) {
                        if (tempMessageIds.has(msg.message)) {
                            tempMessageIds.delete(msg.message);
                        }
                        return true;
                    }
                    return false;
                });
                if (newMessages.length > 0 || nonTempMessages.length !== prev.length) {
                    const combinedMessages = [...nonTempMessages, ...newMessages].sort(
                        (a, b) => {
                            let dateA = 0;
                            let dateB = 0;
                            try {
                                if (a.date) dateA = new Date(a.date).getTime();
                            } catch (e) {  }
                            try {
                                if (b.date) dateB = new Date(b.date).getTime();
                            } catch (e) {  }
                            if (isNaN(dateA)) dateA = 0;
                            if (isNaN(dateB)) dateB = 0;
                            return dateA - dateB;
                        }
                    );
                    return combinedMessages;
                }
                return prev;
            });
        }
    }, [apiMessages, userUuid]);

    useEffect(() => {
        if (initialMessages && initialMessages.length > 0) {
            setUiMessages(initialMessages);
        }
    }, [initialMessages]);

    useEffect(() => {
        if (uiMessages.length > 0) {
            if (flatListRef.current) {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        }
    }, [uiMessages]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        const tempId = `temp-${Date.now()}`;

        try {
            const now = new Date();
            const tempMessage: ApiMessage = {
                uuid: tempId as UUID,
                message: content,
                is_public: workspaceUuid !== null,
                date: now.toISOString(), 
                source: {
                    uuid: userUuid,
                    username: currentUser || "Vous", 
                },
                destination_channel: workspaceUuid
                    ? { uuid: channelUuid }
                    : null,
                destination_user: !workspaceUuid ? { uuid: channelUuid } : null,
                createdReaction: [],
            };

            setUiMessages((prev) => {
                const hasDuplicate = prev.some(msg => {
                    const msgId = typeof msg.uuid === 'string' ? msg.uuid : String(msg.uuid);
                    return msgId.startsWith('temp-') && msg.message === content;
                });
                if (hasDuplicate) {
                    return prev; 
                }
                return [...prev, tempMessage];
            });

            if (externalSendMessage) {
                await externalSendMessage(content);
            } else {
                await apiSendMessage(content);
            }

            setTimeout(() => {
                setUiMessages(prev => {
                    const stillHasTemp = prev.some(msg => {
                        const msgId = typeof msg.uuid === 'string' ? msg.uuid : String(msg.uuid);
                        return msgId === tempId;
                    });
                    if (stillHasTemp) {
                        fetchMessages();
                    }
                    return prev;
                });
            }, 1000); 
        } catch (error) {
            console.error("Erreur lors de l'envoi du message:", error);
            setUiMessages((prev) =>
                prev.filter((msg) => msg.uuid !== tempId)
            );
            Alert.alert(
                "Erreur d'envoi", 
                "Impossible d'envoyer votre message. Veuillez réessayer."
            );
        }
    };

    const handleAddReaction = useCallback(
        async (messageId: UUID, emoji: string) => {
            setActiveMessageId(messageId);
            try {
                const existingReaction = getUserReaction(emoji);
                if (existingReaction) {
                    await apiRemoveReaction(existingReaction.uuid);
                } else {
                    await apiAddReaction(emoji);
                }
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

    const handleReplyToMessage = useCallback((messageId: UUID) => {
        setReplyToMessageId(messageId);
    }, []);

    const handleCopyMessage = useCallback(
        (messageId: UUID) => {
            const messageToCopy = uiMessages.find((m) => m.uuid === messageId);
            if (messageToCopy) {
            }
        },
        [uiMessages],
    );

    const handleEditMessage = useCallback(
        (messageId: UUID, newContent: string) => {
            if (!channelUuid || !newContent.trim()) return;

            apiEditMessage(messageId, newContent)
                .then(() => {
                    setUiMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.uuid === messageId
                                ? { ...msg, message: newContent }
                                : msg,
                        ),
                    );
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

    const replyMessage = replyToMessageId
        ? uiMessages.find((m) => m.uuid === replyToMessageId)
        : null;

    const handleDeleteMessage = useCallback(
        async (messageId: UUID) => {
            try {
                await apiDeleteMessage(messageId);
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

    const handlePickFile = useCallback(async () => {
        try {
            const file = await pickFile();
            if (file) {
                return {
                    uuid: crypto.randomUUID(), 
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

    const renderMessage = useCallback(
        ({ item }: { item: ApiMessage }) => {
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
                        const messageToEdit = uiMessages.find(
                            (msg) => msg.uuid === messageId,
                        );
                        if (messageToEdit) {
                            setActiveMessageId(messageId);
                            setEditMessageContent(messageToEdit.message);
                            setIsEditing(true);
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
                    keyExtractor={(item) => {
                        if (typeof item.uuid === 'string') {
                            return item.uuid;
                        } else if (item.uuid) {
                            return String(item.uuid);
                        } else {
                            return `msg-${Date.now()}-${Math.random()}`;
                        }
                    }}
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

            {}
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
