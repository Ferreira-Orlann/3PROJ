import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomBar from "@/app/components/layout/bottomBar";
import { ChatContainer } from "@/app/components/chat";
import Message from "@/app/components/chat";

// Importation des fichiers séparés
import useMessages from "@/app/hooks/useMessages";
import Channel from "@/app/hooks/channels";
import { styles } from "@/app/styles/channels";
import { UUID } from "crypto";
import workspaceService from "@/app/services/api/endpoints/workspaces";
import websocketService from "@/app/services/websocket/websocket.service";
import channelService from "@/app/services/api/endpoints/channels";
import { useAuth } from "@/app/context/AuthContext";

export default function ChannelScreen() {
    const { token } = useAuth();
    const { user } = useAuth();

    useEffect(() => {
        if (!token) {
            console.log(
                "ChannelScreen - Aucun token d'authentification disponible",
            );
            return;
        }
        websocketService
            .connect(token)
            .then(() => console.log("WebSocket connecté depuis ChannelScreen"))
            .catch((err) =>
                console.error("Erreur de connexion WebSocket:", err),
            );

        return () => {
            websocketService.disconnect();
            console.log("WebSocket déconnecté depuis ChannelScreen");
        };
    }, [token]);
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const router = useRouter();
    const { id: workspaceId, channelId } = params;

    // État pour stocker les informations du workspace et du channel
    const [workspace, setWorkspace] = useState<any>(null);
    const [channel, setChannel] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Utiliser le hook useMessages pour gérer les messages
    const {
        messages,
        loading: messagesLoading,
        error: messagesError,
        fetchMessages,
        sendMessage,
        editMessage,
        deleteMessage,
    } = useMessages(workspaceId as UUID, channelId as UUID);

    // Charger les informations du workspace et du channel
    useEffect(() => {
        const loadWorkspaceAndChannel = async () => {
            setIsLoading(true);

            try {
                // Charger les informations du workspace
                const workspaceData = await workspaceService.getWorkspaceByUuid(
                    workspaceId as UUID,
                );
                setWorkspace(workspaceData);

                // Charger les informations du channel
                const channelData = await channelService.getChannelById(
                    channelId as UUID,
                );
                setChannel(channelData);
            } catch (error) {
                console.error(
                    "ChannelScreen - Erreur lors du chargement des données:",
                    error,
                );
                console.error(
                    "Stack trace:",
                    error instanceof Error ? error.stack : "Pas de stack trace",
                );
            } finally {
                console.log(
                    "ChannelScreen - Fin du chargement, isLoading:",
                    false,
                );
                setIsLoading(false);
            }
        };

        if (workspaceId && channelId) {
            loadWorkspaceAndChannel();
        } else {
            console.log(
                "ChannelScreen - workspaceId ou channelId manquant, pas de chargement",
            );
        }
    }, [workspaceId, channelId]);

    // Charger les messages au chargement du composant
    useEffect(() => {
        if (workspaceId && channelId) {
            fetchMessages()
                .then(() =>
                    console.log("ChannelScreen - Messages chargés avec succès"),
                )
                .catch((err) =>
                    console.error(
                        "ChannelScreen - Erreur lors du chargement des messages:",
                        err,
                    ),
                );
        } else {
            console.log(
                "ChannelScreen - workspaceId ou channelId manquant, pas de chargement des messages",
            );
        }
    }, [workspaceId, channelId, fetchMessages]);

    // Fonctions de gestion des messages et réactions
    const handleSendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) {
                return;
            }

            try {
                await sendMessage(content);
            } catch (error) {
                console.error(
                    "ChannelScreen - Erreur lors de l'envoi du message:",
                    error,
                );
                console.error(
                    "Stack trace:",
                    error instanceof Error ? error.stack : "Pas de stack trace",
                );
            }
        },
        [sendMessage],
    );

    // Si les données sont en cours de chargement ou si le canal n'est pas trouvé
    if (isLoading || !channel) {
        return (
            <>
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <View style={styles.mainContent}>
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>
                                {isLoading
                                    ? "Chargement..."
                                    : "Canal non trouvé"}
                            </Text>
                            {!isLoading && (
                                <TouchableOpacity
                                    style={styles.backButton}
                                    onPress={() => {
                                        console.log(
                                            "ChannelScreen - Bouton Retour pressé",
                                        );
                                        router.back();
                                    }}
                                >
                                    <Text style={styles.backButtonText}>
                                        Retour
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
                <BottomBar />
            </>
        );
    }

    return (
        <>
            <KeyboardAvoidingView
                style={[styles.container, { paddingTop: insets.top }]}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <View style={styles.mainContent}>
                    {/* Channel header */}
                    <View style={styles.header}>
                        <View style={styles.channelInfo}>
                            <View style={styles.channelNameContainer}>
                                <Ionicons
                                    name={
                                        channel.is_public
                                            ? "chatbubble"
                                            : "lock-closed"
                                    }
                                    size={18}
                                    color="#fff"
                                    style={styles.channelIcon}
                                />
                                <Text style={styles.channelName}>
                                    {channel.name}
                                </Text>
                            </View>
                            <Text style={styles.workspaceName}>
                                {workspace?.name}
                            </Text>
                        </View>

                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons
                                    name="people"
                                    size={22}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons
                                    name="search"
                                    size={22}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerButton}>
                                <Ionicons
                                    name="notifications"
                                    size={22}
                                    color="#8e9297"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Chat Container */}
                    {/* Log des props avant le rendu du ChatContainer */}
                    {(() => {
                        console.log(
                            "ChannelScreen - ChatContainer rendu avec props:",
                            {
                                workspaceUuid: workspaceId,
                                userUuid:
                                    workspaceId /* Utiliser workspaceId comme userUuid temporairement */,
                                channelUuid: channelId,
                                channelName: channel.name,
                            },
                        );
                        return null;
                    })()}

                    <ChatContainer
                        workspaceUuid={workspaceId as UUID}
                        userUuid={user?.uuid as UUID}
                        channelUuid={channelId as UUID}
                        channelName={channel.name}
                        currentUser={user?.username || ""}
                        onSendMessage={handleSendMessage}
                    />
                </View>
            </KeyboardAvoidingView>
        </>
    );
}
