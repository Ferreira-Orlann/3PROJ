import React, { useMemo } from "react";
import {
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UUID } from "crypto";
import ChatContainer from "@/app/components/chat/ChatContainer";
import BottomBar from "@/app/components/layout/bottomBar";
import WebSocketDebugger from "@/app/components/debug/WebSocketDebugger";

import { Message as UIMessage } from "../../../services/private_messages";
import { useDirectMessage } from "@/app/hooks/private_messages";
import { styles } from "@/app/styles/private_messages";
import messageService, {
    Message as ApiMessage,
    Reaction as ApiReaction,
} from "@/app/services/api/endpoints/messages";

export default function DirectMessageScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const router = useRouter();
    const userId = params.userId as string;

    const directMessageHook = useDirectMessage(userId);
    const {
        user,
        messages,
        loading,
        error,
        currentUserUuid,
        handleSendMessage,
    } = directMessageHook;

    console.log("DirectMessageScreen - userId:", userId);
    console.log("DirectMessageScreen - currentUserUuid:", currentUserUuid);
    console.log("DirectMessageScreen - user:", JSON.stringify(user));
    console.log("DirectMessageScreen - nombre de messages:", messages.length);
    if (messages.length > 0) {
        console.log(
            "DirectMessageScreen - dernier message:",
            JSON.stringify(messages[messages.length - 1]),
        );
    }

    const apiMessages = useMemo(() => {
        return messages.map((uiMessage) => {
            const reactions: ApiReaction[] = [];

            if (uiMessage.reactions && uiMessage.reactions.length > 0) {
                uiMessage.reactions.forEach((r) => {
                    const userUuid = r.users[0] || currentUserUuid;
                    reactions.push({
                        uuid: (uiMessage.id + "-" + r.emoji) as UUID,
                        emoji: r.emoji,
                        user: {
                            uuid: userUuid as UUID,
                            username:
                                userUuid === currentUserUuid ? "Moi" : "User",
                        },
                    });
                });
            }

            let source: string | { uuid: UUID; username: string };
            if (uiMessage.sender === "Moi" && currentUserUuid) {
                source = {
                    uuid: currentUserUuid,
                    username: "Moi",
                };
            } else {
                source = {
                    uuid: userId as UUID,
                    username: uiMessage.sender,
                };
            }

            let destination_user: string | { uuid: UUID } | null;
            if (uiMessage.sender === "Moi") {
                destination_user = { uuid: userId as UUID };
            } else {
                destination_user = { uuid: currentUserUuid as UUID };
            }

            const apiMessage: ApiMessage = {
                uuid: uiMessage.id as UUID,
                message: uiMessage.content,
                is_public: false,
                date: new Date().toISOString(),
                source: source,
                destination_channel: null,
                destination_user: destination_user,
                createdReaction: reactions,
            };

            return apiMessage;
        });
    }, [messages, currentUserUuid, userId]);

    console.log("Nombre de messages API après conversion:", apiMessages.length);

    if (loading) {
        return (
            <>
                <KeyboardAvoidingView
                    style={[styles.container, { paddingTop: insets.top }]}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                >
                    <View style={styles.mainContent}>
                        <View style={styles.errorContainer}>
                            <Text style={styles.loadingText}>
                                Chargement...
                            </Text>
                        </View>
                    </View>
                </KeyboardAvoidingView>
                <BottomBar />
            </>
        );
    }

    if (error || !user) {
        return (
            <>
                <KeyboardAvoidingView
                    style={[styles.container, { paddingTop: insets.top }]}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                >
                    <View style={styles.mainContent}>
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                {error || "Utilisateur non trouvé"}
                            </Text>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.backButtonText}>
                                    Retour
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
                <BottomBar />
            </>
        );
    }

    return (
        <>
            <WebSocketDebugger />
            <KeyboardAvoidingView
                style={[styles.container, { paddingTop: insets.top }]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <View style={styles.mainContent}>
                    {/* User header */}
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            <View style={styles.userNameContainer}>
                                <View
                                    style={[
                                        styles.statusIndicator,
                                        {
                                            backgroundColor:
                                                user.status === "en ligne"
                                                    ? "#43b581"
                                                    : user.status === "absent"
                                                      ? "#faa61a"
                                                      : "#747f8d",
                                        },
                                    ]}
                                />
                                <Text style={styles.userName}>
                                    {user.name || user.username}
                                </Text>
                            </View>
                            <Text style={styles.userStatus}>
                                {user.status || "hors ligne"}
                            </Text>
                        </View>

                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons
                                    name="call"
                                    size={22}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons
                                    name="videocam"
                                    size={22}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons
                                    name="information-circle"
                                    size={22}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ChatContainer
                        workspaceUuid={null}
                        userUuid={currentUserUuid as UUID}
                        channelUuid={userId as UUID}
                        channelName={user?.name || ""}
                        currentUser="Moi"
                        initialMessages={apiMessages} 
                        onSendMessage={handleSendMessage}
                    />
                    <View
                        style={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            backgroundColor: "rgba(0,0,0,0.5)",
                            padding: 5,
                            borderRadius: 5,
                        }}
                    >
                        <Text style={{ color: "white", fontSize: 10 }}>
                            Messages: {messages.length} | API:{" "}
                            {apiMessages.length}
                        </Text>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

