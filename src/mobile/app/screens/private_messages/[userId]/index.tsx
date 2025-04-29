import React from "react";
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
import ChatContainer from "@/app/components/chat/ChatContainer";
import BottomBar from "@/app/components/layout/bottomBar";

// Importation des fichiers séparés
import { Attachment } from "../../../services/private_messages";
import { useDirectMessage } from "@/app/hooks/private_messages";
import { styles } from "@/app/styles/private_messages";

export default function DirectMessageScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();
    const router = useRouter();
    const userId = params.userId as string;

    // Utiliser le hook personnalisé pour la logique de l'écran
    const { user, messages, handleSendMessage, handleAddReaction } =
        useDirectMessage(userId);

    // Afficher un message d'erreur si l'utilisateur n'existe pas
    if (!user) {
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
                                Utilisateur non trouvé
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
                                <Text style={styles.userName}>{user.name}</Text>
                            </View>
                            <Text style={styles.userStatus}>{user.status}</Text>
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

                    {/* Chat Container */}
                    <ChatContainer
                        messages={messages}
                        currentUser="Moi"
                        onSendMessage={handleSendMessage}
                        onAddReaction={handleAddReaction}
                    />
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

// Les styles sont importés depuis index.styles.ts
