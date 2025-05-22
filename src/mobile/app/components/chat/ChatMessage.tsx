import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EmojiPicker from "./EmojiPicker";
import { UUID } from "crypto";
import {
    Message as ApiMessage,
} from "../../services/api/endpoints/messages";
import userService from "../../services/api/endpoints/users";
import { Attachment as ApiAttachment } from "../../services/api/endpoints/attachments";
import reactionService, { Reaction } from "../../services/api/endpoints/reactions";
import { useAuth } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type pour les réactions regroupées dans l'UI (nécessaire pour l'affichage)
interface UIReaction {
    emoji: string;
    count: number;
    users: string[];
}

interface ChatMessageProps {
    message: ApiMessage;
    isCurrentUser: boolean;
    onAddReaction?: (messageId: UUID, emoji: string) => void;
    onShowEmojiPicker?: () => void;
    onDeleteMessage?: (messageId: UUID) => void;
    onReplyToMessage?: (messageId: UUID) => void;
    onCopyMessage?: (messageId: UUID) => void;
    onEditMessage?: (messageId: UUID) => void;
    onPinMessage?: (messageId: UUID) => void;
    workspaceUuid?: UUID | null;
    channelUuid?: UUID;
    userUuid?: UUID;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    isCurrentUser,
    onAddReaction,
    onShowEmojiPicker,
    onDeleteMessage,
    onReplyToMessage,
    onCopyMessage,
    onEditMessage,
    onPinMessage,
    workspaceUuid,
    channelUuid,
    userUuid,
}) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showActionsModal, setShowActionsModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [senderName, setSenderName] = useState("");
    const [messageReactions, setMessageReactions] = useState<Reaction[]>([]);
    const [isLoadingReactions, setIsLoadingReactions] = useState(false);
    const [showReactionUsers, setShowReactionUsers] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState<string>("");
    const [reactionUsers, setReactionUsers] = useState<{uuid: string, username: string}[]>([]);
    const isMounted = useRef(true);
    const { user } = useAuth();

    // Fonction pour obtenir l'UUID de l'utilisateur courant
    const getCurrentUserUuid = useCallback(async () => {
        if (userUuid) {
            return userUuid;
        }

        try {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                return parsedUser.uuid;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur:", error);
        }

        return null;
    }, [userUuid]);

    // Fonction pour charger les réactions depuis l'API
    const fetchReactions = useCallback(async () => {
        if (!message.uuid || !channelUuid || isLoadingReactions) {
            return;
        }

        setIsLoadingReactions(true);

        try {
            let reactions: Reaction[] = [];

            // Déterminer si nous sommes dans un message direct ou un canal de workspace
            if (workspaceUuid) {
                // Canal de workspace
                reactions = await reactionService.getReactions(
                    workspaceUuid,
                    channelUuid,
                    message.uuid
                );
                
            } else {
                // Message direct
                const currentUserUuid = await getCurrentUserUuid();
                if (currentUserUuid) {
                    reactions = await reactionService.getDirectMessageReactions(
                        currentUserUuid,
                        channelUuid,
                        message.uuid
                    );
                }
            }

            // Vérifier que les réactions appartiennent bien à ce message
            const filteredReactions = reactions.filter(reaction => {
                // Vérifier si la réaction a un message et si l'UUID du message correspond
                return reaction.message && 
                       ((typeof reaction.message === 'object' && reaction.message.uuid === message.uuid) ||
                        (typeof reaction.message === 'string' && reaction.message === message.uuid));
            });

            if (isMounted.current) {
                setMessageReactions(filteredReactions);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des réactions:", error);
        } finally {
            if (isMounted.current) {
                setIsLoadingReactions(false);
            }
        }
    }, [message.uuid, channelUuid, workspaceUuid, getCurrentUserUuid, isLoadingReactions]);

    // Gérer l'ajout ou la suppression d'une réaction
    const handleReaction = useCallback(async (emoji: string) => {
        if (!channelUuid || !message.uuid) {
            return;
        }

        setLoading(true);

        try {
            const currentUserUuid = await getCurrentUserUuid();
            if (!currentUserUuid) {
                return;
            }

            // Vérifier si l'utilisateur a déjà réagi avec cet emoji
            const hasReacted = hasUserReacted(emoji);

            if (hasReacted) {
                // Trouver l'UUID de la réaction à supprimer
                const reactionToRemove = messageReactions.find(
                    (r) => r.emoji === emoji && (
                        (typeof r.user === 'object' && r.user.uuid === currentUserUuid) ||
                        (typeof r.user === 'string' && r.user === currentUserUuid)
                    ) && (
                        // Vérifier que la réaction appartient bien à ce message
                        (typeof r.message === 'object' && r.message.uuid === message.uuid) ||
                        (typeof r.message === 'string' && r.message === message.uuid)
                    )
                );

                if (reactionToRemove && reactionToRemove.uuid) {
                    // Supprimer la réaction
                    if (workspaceUuid) {
                        await reactionService.removeReaction(
                            workspaceUuid,
                            channelUuid,
                            message.uuid,
                            reactionToRemove.uuid
                        );
                    } else {
                        await reactionService.removeDirectMessageReaction(
                            currentUserUuid,
                            channelUuid,
                            message.uuid,
                            reactionToRemove.uuid
                        );
                    }
                }
            } else {
                // Ajouter une nouvelle réaction
                const data = {
                    emoji,
                    user_uuid: currentUserUuid,
                    message_uuid: message.uuid,
                };

                if (workspaceUuid) {
                    await reactionService.addReaction(
                        workspaceUuid,
                        channelUuid,
                        message.uuid,
                        data
                    );
                } else {
                    await reactionService.addDirectMessageReaction(
                        currentUserUuid,
                        channelUuid,
                        message.uuid,
                        data
                    );
                }
            }

            // Recharger les réactions après modification
            await fetchReactions();

            // Si un gestionnaire externe est fourni, l'appeler aussi
            if (onAddReaction) {
                onAddReaction(message.uuid, emoji);
            }
        } catch (error) {
            console.error("ChatMessage - handleReaction - Erreur:", error);
            Alert.alert("Erreur", "Impossible de gérer la réaction. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    }, [message.uuid, channelUuid, workspaceUuid, getCurrentUserUuid, onAddReaction, messageReactions, fetchReactions]);

    // Convertir les réactions API en réactions UI pour l'affichage
    const getUIReactions = useCallback((): UIReaction[] => {
        const groupedReactions: UIReaction[] = [];

        // Utiliser les réactions chargées depuis l'API
        if (!messageReactions || messageReactions.length === 0) {
            return [];
        }
        
        // Traiter chaque réaction et les regrouper par emoji
        messageReactions.forEach((reaction) => {
            // Vérifier que la réaction est valide
            if (!reaction || !reaction.emoji || !reaction.user) {
                return;
            }
            
            // Vérifier que la réaction appartient bien à ce message
            const isForCurrentMessage = reaction.message && (
                (typeof reaction.message === 'object' && reaction.message.uuid === message.uuid) ||
                (typeof reaction.message === 'string' && reaction.message === message.uuid)
            );
            
            if (!isForCurrentMessage) {
                return;
            }
            
            // Extraire l'UUID de l'utilisateur (peut être un objet ou une chaîne)
            const userUuid = typeof reaction.user === 'object' ? reaction.user.uuid : reaction.user;
            
            // Rechercher si cette réaction existe déjà dans notre groupe
            const existingReaction = groupedReactions.find(
                (r) => r.emoji === reaction.emoji
            );
            
            if (existingReaction) {
                // Incrémenter le compteur et ajouter l'utilisateur
                existingReaction.count++;
                // Éviter les doublons d'utilisateurs dans la liste
                if (!existingReaction.users.includes(userUuid)) {
                    existingReaction.users.push(userUuid);
                }
            } else {
                // Créer une nouvelle entrée pour cette réaction
                groupedReactions.push({
                    emoji: reaction.emoji,
                    count: 1,
                    users: [userUuid],
                });
            }
        });
        
        return groupedReactions;
    }, [messageReactions, message.uuid]);
    
    // Vérifier si l'utilisateur courant a déjà réagi avec un emoji spécifique
    const hasUserReacted = useCallback((emoji: string): boolean => {
        if (!messageReactions || messageReactions.length === 0) {
            return false;
        }
        
        // Récupérer l'UUID de l'utilisateur courant depuis les props ou le contexte
        const currentUserUuidValue = userUuid || 
            (typeof user?.uuid === 'string' ? user.uuid : null);
        
        if (!currentUserUuidValue) {
            return false;
        }
        
        return messageReactions.some(reaction => {
            if (!reaction || !reaction.emoji || reaction.emoji !== emoji || !reaction.user) {
                return false;
            }
            
            // Vérifier que la réaction appartient bien à ce message
            const isForCurrentMessage = reaction.message && (
                (typeof reaction.message === 'object' && reaction.message.uuid === message.uuid) ||
                (typeof reaction.message === 'string' && reaction.message === message.uuid)
            );
            
            if (!isForCurrentMessage) {
                return false;
            }
            
            // Vérifier si l'utilisateur de la réaction correspond à l'utilisateur courant
            if (typeof reaction.user === 'object' && reaction.user.uuid) {
                return reaction.user.uuid === currentUserUuidValue;
            } else if (typeof reaction.user === 'string') {
                return reaction.user === currentUserUuidValue;
            }
            
            return false;
        });
    }, [messageReactions, userUuid, user, message.uuid]);
    
    // Afficher la liste des utilisateurs qui ont réagi avec un emoji spécifique
    const handleShowReactionUsers = useCallback(async (emoji: string) => {
        // Filtrer les réactions pour cet emoji et ce message
        const filteredReactions = messageReactions.filter(reaction => 
            reaction && reaction.emoji === emoji && (
                // Vérifier que la réaction appartient bien à ce message
                (typeof reaction.message === 'object' && reaction.message.uuid === message.uuid) ||
                (typeof reaction.message === 'string' && reaction.message === message.uuid)
            )
        );
        
        // Extraire les informations des utilisateurs
        const users: {uuid: string, username: string}[] = [];
        
        for (const reaction of filteredReactions) {
            if (!reaction.user) continue;
            
            let userUuid: string;
            let username: string = "Utilisateur inconnu";
            
            if (typeof reaction.user === 'object' && reaction.user.uuid) {
                userUuid = reaction.user.uuid;
                username = reaction.user.username || "Utilisateur inconnu";
            } else if (typeof reaction.user === 'string') {
                userUuid = reaction.user;
                try {
                    // Récupérer les informations de l'utilisateur si nécessaire
                    const userInfo = await userService.getUserById(reaction.user as UUID);
                    if (userInfo && userInfo.username) {
                        username = userInfo.username;
                    }
                } catch (error) {
                    console.error("Erreur lors de la récupération des informations utilisateur:", error);
                }
            } else {
                continue; // Ignorer les réactions avec des utilisateurs invalides
            }
            
            // Éviter les doublons
            if (!users.some(u => u.uuid === userUuid)) {
                users.push({ uuid: userUuid, username });
            }
        }
        
        setReactionUsers(users);
        setSelectedEmoji(emoji);
        setShowReactionUsers(true);
    }, [messageReactions, message.uuid]);

    const reactions = getUIReactions();
    const timestamp = new Date(message.date).toLocaleTimeString();

    // Effet pour marquer le composant comme démonté lors du nettoyage
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);
    
    // Charger les réactions au montage du composant et lorsque le message change
    useEffect(() => {
        fetchReactions();
    }, [fetchReactions, message.uuid]);
    
    // Fetch user information when the component mounts or when the message source changes
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Vérifier si message.source est un objet ou une chaîne
                if (
                    typeof message.source === "object" &&
                    message.source !== null &&
                    message.source.username
                ) {
                    // Si c'est un objet avec un username, utiliser directement
                    setSenderName(message.source.username);
                } else if (typeof message.source === "string") {
                    // Si c'est une chaîne (UUID), récupérer les infos utilisateur
                    const user = await userService.getUserById(
                        message.source as UUID,
                    );
                    if (isMounted.current) {
                        setSenderName(user.username);
                    }
                } else {
                    console.error(
                        "ChatMessage - Format de source invalide:",
                        message.source,
                    );
                    if (isMounted.current) {
                        setSenderName("Unknown");
                    }
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
                if (isMounted.current) {
                    setSenderName("Unknown");
                }
            }
        };

        fetchUserInfo();
    }, [message.source]);

    return (
        <View
            style={[
                styles.messageContainer,
                isCurrentUser ? styles.myMessage : styles.otherMessage,
            ]}
        >
            <View
                style={[
                    styles.messageHeader,
                    isCurrentUser
                        ? styles.myMessageHeader
                        : styles.otherMessageHeader,
                ]}
            >
                <Text style={styles.sender}>{senderName}</Text>
                <Text style={styles.timestamp}>{timestamp}</Text>
            </View>

            <Text style={styles.messageText}>{message.message}</Text>

            {/* Attachments - À implémenter quand les pièces jointes seront disponibles */}

            {/* Reactions */}
            {reactions.length > 0 && (
                <View style={styles.reactionsContainer}>
                    {reactions.map((reaction, index) => {
                        const isReactedByUser = hasUserReacted(reaction.emoji);
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.reaction,
                                    isReactedByUser && styles.reactionSelected
                                ]}
                                onPress={() => handleShowReactionUsers(reaction.emoji)}
                                disabled={loading}
                            >
                                <Text style={styles.reactionEmoji}>
                                    {reaction.emoji}
                                </Text>
                                <Text style={[
                                    styles.reactionCount,
                                    isReactedByUser && styles.reactionCountSelected
                                ]}>
                                    {reaction.count}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            {/* Message actions */}
            <View style={styles.messageActions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        setShowEmojiPicker(true);
                        if (onShowEmojiPicker) onShowEmojiPicker();
                    }}
                    disabled={loading}
                >
                    <Ionicons name="happy-outline" size={18} color={loading ? "#666" : "#8e9297"} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowActionsModal(true)}
                    disabled={loading}
                >
                    <Ionicons
                        name="ellipsis-horizontal"
                        size={18}
                        color={loading ? "#666" : "#8e9297"}
                    />
                </TouchableOpacity>
            </View>

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
                                        handleReaction(emoji);
                                        setShowEmojiPicker(false);
                                    }}
                                    onClose={() => setShowEmojiPicker(false)}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}

            {/* Reaction Users Modal */}
            {showReactionUsers && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={showReactionUsers}
                    onRequestClose={() => setShowReactionUsers(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setShowReactionUsers(false)}
                    >
                        <View style={styles.reactionUsersModalContent}>
                            <View style={styles.reactionUsersHeader}>
                                <Text style={styles.reactionUsersTitle}>
                                    Utilisateurs ayant réagi avec {selectedEmoji}
                                </Text>
                                <TouchableOpacity onPress={() => setShowReactionUsers(false)}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            
                            {reactionUsers.length > 0 ? (
                                <FlatList
                                    data={reactionUsers}
                                    keyExtractor={(item) => item.uuid}
                                    renderItem={({ item }) => {
                                        // Vérifier si c'est l'utilisateur courant
                                        const isCurrentUser = item.uuid === userUuid || 
                                            (typeof user?.uuid === 'string' && item.uuid === user.uuid);
                                        
                                        return (
                                            <View style={styles.reactionUserItem}>
                                                <Text style={styles.reactionUsername}>
                                                    {item.username}
                                                </Text>
                                                {isCurrentUser && (
                                                    <TouchableOpacity 
                                                        style={styles.removeReactionButton}
                                                        onPress={() => {
                                                            handleReaction(selectedEmoji);
                                                            setShowReactionUsers(false);
                                                        }}
                                                    >
                                                        <Ionicons name="trash-outline" size={18} color="#ff4d4f" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        );
                                    }}
                                />
                            ) : (
                                <Text style={styles.noReactionsText}>Aucun utilisateur n'a réagi avec cet emoji</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
            
            {/* Actions Modal */}
            {showActionsModal && (
                <Modal
                    transparent={true}
                    animationType="fade"
                    visible={showActionsModal}
                    onRequestClose={() => setShowActionsModal(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContainer}
                        activeOpacity={1}
                        onPress={() => setShowActionsModal(false)}
                    >
                        <View
                            style={[
                                styles.actionsModalContent,
                                isCurrentUser
                                    ? styles.actionsModalRight
                                    : styles.actionsModalLeft,
                            ]}
                        >
                            {onReplyToMessage && (
                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        onReplyToMessage(message.uuid);
                                        setShowActionsModal(false);
                                    }}
                                >
                                    <Ionicons
                                        name="return-down-back"
                                        size={20}
                                        color="#dcddde"
                                    />
                                    <Text style={styles.actionText}>Reply</Text>
                                </TouchableOpacity>
                            )}

                            {onCopyMessage && (
                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        onCopyMessage(message.uuid);
                                        setShowActionsModal(false);
                                    }}
                                >
                                    <Ionicons
                                        name="copy-outline"
                                        size={20}
                                        color="#dcddde"
                                    />
                                    <Text style={styles.actionText}>
                                        Copy Text
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {isCurrentUser && onEditMessage && (
                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        onEditMessage(message.uuid);
                                        setShowActionsModal(false);
                                    }}
                                >
                                    <Ionicons
                                        name="pencil"
                                        size={20}
                                        color="#dcddde"
                                    />
                                    <Text style={styles.actionText}>Edit</Text>
                                </TouchableOpacity>
                            )}

                            {onPinMessage && (
                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        onPinMessage(message.uuid);
                                        setShowActionsModal(false);
                                    }}
                                >
                                    <Ionicons
                                        name="pin"
                                        size={20}
                                        color="#0721f8"
                                    />
                                    <Text style={styles.actionText}>
                                        Pin to Channel
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {isCurrentUser && onDeleteMessage && (
                                <TouchableOpacity
                                    style={[
                                        styles.actionItem,
                                        styles.deleteAction,
                                    ]}
                                    onPress={() => {
                                        onDeleteMessage(message.uuid);
                                        setShowActionsModal(false);
                                    }}
                                >
                                    <Ionicons
                                        name="trash"
                                        size={20}
                                        color="#ed4245"
                                    />
                                    <Text
                                        style={[
                                            styles.actionText,
                                            styles.deleteText,
                                        ]}
                                    >
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    messageContainer: {
        marginVertical: 15,
        maxWidth: "85%",
        padding: 12,
        marginBottom: 50,
        borderRadius: 8,
        position: "relative",
    },
    myMessage: {
        alignSelf: "flex-end",
        backgroundColor: "#6f62a4",
        marginRight: 10,
        borderTopRightRadius: 4, // Smaller radius on the side where the message is aligned
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        alignSelf: "flex-start",
        backgroundColor: "#373d49",
        marginLeft: 10,
        borderTopLeftRadius: 4, // Smaller radius on the side where the message is aligned
        borderBottomLeftRadius: 4,
    },
    messageHeader: {
        flexDirection: "row",
        marginBottom: 5,
    },
    myMessageHeader: {
        justifyContent: "flex-end", // Align to the right for current user's messages
    },
    otherMessageHeader: {
        justifyContent: "flex-start", // Align to the left for other users' messages
    },
    sender: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    timestamp: {
        color: "#8e9297",
        fontSize: 12,
        marginLeft: 8,
    },
    messageText: {
        color: "#dcddde",
        fontSize: 15,
        lineHeight: 20,
    },
    attachmentsContainer: {
        marginTop: 10,
    },
    attachment: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#494d55",
        borderRadius: 4,
        padding: 8,
        marginTop: 5,
    },
    attachmentInfo: {
        marginLeft: 5,
    },
    attachmentName: {
        color: "#dcddde",
        fontSize: 14,
    },
    attachmentSize: {
        color: "#8e9297",
        fontSize: 12,
    },
    reactionsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
    },
    reaction: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2f3136",
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: "transparent",
        minWidth: 36, // Assurer une largeur minimale pour une meilleure apparence
        justifyContent: "center", // Centrer le contenu horizontalement
    },
    reactionSelected: {
        backgroundColor: "#4f545c",
        borderColor: "#5865f2",
    },
    reactionEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    reactionCount: {
        color: "#dcddde",
        fontSize: 12,
        minWidth: 12, // Assurer une largeur minimale pour le compteur
        textAlign: "center", // Centrer le texte
    },
    reactionCountSelected: {
        color: "#ffffff",
        fontWeight: "bold",
    },
    reactionUsersModalContent: {
        backgroundColor: "#36393f",
        borderRadius: 8,
        padding: 16,
        width: "80%",
        maxHeight: 300,
        elevation: 5,
    },
    reactionUsersHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#202225",
        paddingBottom: 8,
    },
    reactionUsersTitle: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
    reactionUserItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#202225",
    },
    reactionUsername: {
        color: "#dcddde",
        fontSize: 14,
    },
    removeReactionButton: {
        padding: 4,
    },
    noReactionsText: {
        color: "#8e9297",
        textAlign: "center",
        marginTop: 16,
    },
    messageActions: {
        position: "absolute",
        top: -30,
        right: 0,
        flexDirection: "row",
        backgroundColor: "#36393f",
        borderRadius: 4,
        padding: 4,
        opacity: 0.9,
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
    },
    actionsModalContent: {
        position: "absolute",
        width: 150,
        backgroundColor: "#36393f",
        borderRadius: 4,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    actionsModalRight: {
        right: 20,
        top: "40%",
    },
    actionsModalLeft: {
        left: 20,
        top: "40%",
    },
    actionItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#202225",
    },
    actionText: {
        marginLeft: 10,
        color: "#dcddde",
        fontSize: 14,
    },
    deleteAction: {
        borderBottomWidth: 0,
    },
    deleteText: {
        color: "#ed4245",
    },
    actionButton: {
        padding: 4,
        marginHorizontal: 2,
    },
});

export default ChatMessage;
