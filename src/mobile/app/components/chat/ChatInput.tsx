import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    Modal,
    ActivityIndicator,
    ToastAndroid,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/app/theme/colors";
import EmojiPicker from "./EmojiPicker";
import websocketService from "@/app/services/websocket/websocket.service";
import { Message as ApiMessage } from "../../services/api/endpoints/messages";
import { Attachment as ApiAttachment } from "../../services/api/endpoints/attachments";

interface ChatInputProps {
    channelName?: string;
    placeholder?: string;
    onSendMessage: (
        message: string,
        attachments: ApiAttachment[],
    ) => Promise<any>;
    onAddReaction?: (emoji: string) => void;
    replyMessage?: ApiMessage | null;
    onCancelReply?: () => void;
    onPickFile?: () => Promise<ApiAttachment | null>;
    isOfflineMode?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    channelName = "",
    placeholder,
    onSendMessage,
    onAddReaction,
    replyMessage,
    onCancelReply,
    onPickFile,
    isOfflineMode = false,
}) => {
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const [attachments, setAttachments] = useState<ApiAttachment[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(
        websocketService.isConnected(),
    );


    useEffect(() => {
        const checkInterval = setInterval(() => {
            const connected = websocketService.isConnected();
            if (connected !== isWebSocketConnected) {
                console.log("WebSocket connection state changed:", connected);
                setIsWebSocketConnected(connected);
            }
        }, 3000);

        return () => clearInterval(checkInterval);
    }, [isWebSocketConnected]);


    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        setShowAttachmentOptions(false);
    };


    const handleEmojiSelect = (emoji: string) => {
        if (onAddReaction) {
            onAddReaction(emoji);
        } else {
            setMessage((prev) => prev + emoji);
        }
        setShowEmojiPicker(false);
    };


    const toggleAttachmentOptions = () => {
        setShowAttachmentOptions(!showAttachmentOptions);
        setShowEmojiPicker(false);
    };


    const handleSend = async () => {
        if (!message.trim()) return;

        try {
            setIsSending(true);


            if (!isWebSocketConnected && Platform.OS === "android") {
                ToastAndroid.show(
                    "Mode hors ligne: Le message sera envoyé mais ne sera pas visible en temps réel pour les autres utilisateurs",
                    ToastAndroid.SHORT,
                );
            }


            await onSendMessage(message, attachments);


            setMessage("");
            setAttachments([]);
            if (replyMessage && onCancelReply) {
                onCancelReply();
            }
        } catch (error) {
            console.error(
                "ChatInput - Erreur lors de l'envoi du message:",
                error,
            );
            if (Platform.OS === "android") {
                ToastAndroid.show(
                    "Erreur lors de l'envoi du message. Veuillez réessayer.",
                    ToastAndroid.SHORT,
                );
            }
        } finally {
            setIsSending(false);
        }
    };


    const handleAttachmentSelect = async (type: string) => {
        if (onPickFile) {

            const attachment = await onPickFile();
            if (attachment) {
                setAttachments([...attachments, attachment]);
            }
        } else {

            console.log(`Attachment selection of type ${type} requested but no onPickFile handler provided`);
        }
        setShowAttachmentOptions(false);
    };

    return (
        <>

            {replyMessage && (
                <View style={styles.replyContainer}>
                    <View style={styles.replyContent}>
                        <Text style={styles.replyLabel}>
                            Replying to{" "}
                            <Text style={styles.replySender}>
                                {typeof replyMessage.source === "object" &&
                                replyMessage.source?.username
                                    ? replyMessage.source.username
                                    : "Unknown"}
                            </Text>
                        </Text>
                        <Text style={styles.replyMessage} numberOfLines={1}>
                            {replyMessage.message}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.cancelReplyButton}
                        onPress={onCancelReply}
                    >
                        <Ionicons name="close" size={18} color="#8e9297" />
                    </TouchableOpacity>
                </View>
            )}


            <View style={styles.inputContainer}>

                <View
                    style={[
                        styles.connectionIndicator,
                        isWebSocketConnected
                            ? styles.connected
                            : styles.disconnected,
                    ]}
                />


                <TouchableOpacity
                    onPress={toggleAttachmentOptions}
                    style={styles.iconButton}
                >
                    <Ionicons name="attach" size={24} color="#8e9297" />
                </TouchableOpacity>


                <TextInput
                    style={styles.input}
                    placeholder={
                        placeholder ||
                        `Message ${channelName ? "#" + channelName : ""}`
                    }
                    placeholderTextColor="#8e9297"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    editable={!isSending}
                />


                <TouchableOpacity
                    onPress={toggleEmojiPicker}
                    style={styles.iconButton}
                    disabled={isSending}
                >
                    <Ionicons name="happy-outline" size={24} color="#8e9297" />
                </TouchableOpacity>


                {isSending ? (
                    <View style={styles.sendButton}>
                        <ActivityIndicator size="small" color="#fff" />
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleSend}
                        style={[
                            styles.sendButton,
                            !message.trim() && styles.sendButtonDisabled,
                        ]}
                        disabled={!message.trim() || isSending}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={message.trim() ? "#fff" : "#8e9297"}
                        />
                    </TouchableOpacity>
                )}
            </View>


            <Modal
                visible={showEmojiPicker}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowEmojiPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowEmojiPicker(false)}
                >
                    <View style={styles.modalContent}>
                        <EmojiPicker
                            onEmojiSelected={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>


            {showAttachmentOptions && (
                <View style={styles.attachmentOptions}>
                    <TouchableOpacity
                        style={styles.attachmentOption}
                        onPress={() => handleAttachmentSelect("image")}
                    >
                        <View
                            style={[
                                styles.attachmentOptionIcon,
                                { backgroundColor: "#4caf50" },
                            ]}
                        >
                            <Ionicons name="image" size={24} color="#fff" />
                        </View>
                        <Text style={styles.attachmentOptionText}>Image</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.attachmentOption}
                        onPress={() => handleAttachmentSelect("video")}
                    >
                        <View
                            style={[
                                styles.attachmentOptionIcon,
                                { backgroundColor: "#2196f3" },
                            ]}
                        >
                            <Ionicons name="videocam" size={24} color="#fff" />
                        </View>
                        <Text style={styles.attachmentOptionText}>Vidéo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.attachmentOption}
                        onPress={() => handleAttachmentSelect("document")}
                    >
                        <View
                            style={[
                                styles.attachmentOptionIcon,
                                { backgroundColor: "#ff9800" },
                            ]}
                        >
                            <Ionicons name="document" size={24} color="#fff" />
                        </View>
                        <Text style={styles.attachmentOptionText}>
                            Document
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: "#36393f",
        borderTopWidth: 1,
        borderTopColor: "#202225",
    },
    connectionIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    connected: {
        backgroundColor: "#43b581",
    },
    disconnected: {
        backgroundColor: "#f04747",
    },
    iconButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        backgroundColor: "#40444b",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginHorizontal: 8,
        color: "#dcddde",
        fontSize: 16,
        maxHeight: 100,
        minHeight: 40,
    },
    emojiButton: {
        padding: 8,
    },
    sendButton: {
        backgroundColor: "#5865f2",
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 5,
    },
    sendButtonDisabled: {
        backgroundColor: "#40444b",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#2f3136",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: "hidden",
        width: "100%",
        maxHeight: "50%",
    },
    replyContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#36393f",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#202225",
        borderLeftWidth: 4,
        borderLeftColor: "#6f62a4",
    },
    replyContent: {
        flex: 1,
    },
    replyLabel: {
        color: "#8e9297",
        fontSize: 12,
    },
    replySender: {
        fontWeight: "bold",
        color: "#dcddde",
    },
    replyMessage: {
        color: "#dcddde",
        fontSize: 13,
        marginTop: 2,
    },
    cancelReplyButton: {
        padding: 5,
    },
    attachmentOptions: {
        backgroundColor: "#2f3136",
        padding: 15,
        flexDirection: "row",
        justifyContent: "space-around",
        borderTopWidth: 1,
        borderTopColor: "#202225",
    },
    attachmentOption: {
        alignItems: "center",
        marginHorizontal: 10,
    },
    attachmentOptionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    attachmentOptionText: {
        color: "#dcddde",
        fontSize: 12,
    },
});

export default ChatInput;
