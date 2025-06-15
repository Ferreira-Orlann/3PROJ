import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Switch,
    Modal,
    ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Notification } from "../../services/notifications";
import useNotificationsApi from "../../hooks/useNotifications";
import useWebSocket from "../../hooks/useWebSocket";
import { styles } from "../../styles/Notifications";

export default function NotificationsScreen() {
    const { socket } = useWebSocket();
    
    const {
        notifications,
        preferences,
        showPreferences,
        setShowPreferences,
        setPreferences,
        savePreferences,
        markAsRead,
        markAllAsRead,
        getIcon,
        refreshNotifications
    } = useNotificationsApi(socket);
    
    React.useEffect(() => {
        refreshNotifications();
        
        const refreshInterval = setInterval(() => {
            refreshNotifications();
        }, 5000); 
        
        return () => clearInterval(refreshInterval);
    }, [refreshNotifications]);

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notification, !item.read && styles.unread]}
            onPress={() => {
                markAsRead(item.uuid);

                if (
                    item.sourceType === "channel" &&
                    item.workspaceId &&
                    item.channelId
                ) {
                    router.push(
                        `/screens/workspaces/${item.workspaceId}/channels/${item.channelId}`,
                    );
                } else if (item.sourceType === "directMessage" && item.userId) {
                    router.push({
                        pathname: "/screens/private_messages/[userId]",
                        params: { userId: item.userId },
                    });
                } else if (
                    item.sourceType === "workspace" &&
                    item.workspaceId
                ) {
                    router.push(`/screens/workspaces/${item.workspaceId}`);
                }
            }}
        >
            <View
                style={[styles.iconContainer, !item.read && styles.unreadIcon]}
            >
                <FontAwesome
                    name={getIcon(item.type)}
                    size={16}
                    color={item.read ? "#666" : "#9c5fff"}
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderPreferencesModal = () => (
        <Modal
            visible={showPreferences}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            Préférences de notification
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowPreferences(false)}
                        >
                            <FontAwesome name="times" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScroll}>
                        <View style={styles.preferenceSection}>
                            <Text style={styles.sectionTitle}>
                                Paramètres généraux
                            </Text>

                            <View style={styles.preferenceItem}>
                                <Text style={styles.preferenceLabel}>
                                    Notifications push
                                </Text>
                                <Switch
                                    trackColor={{
                                        false: "#767577",
                                        true: "#9c5fff",
                                    }}
                                    thumbColor={
                                        preferences.enablePush
                                            ? "#f5dd4b"
                                            : "#f4f3f4"
                                    }
                                    onValueChange={() =>
                                        setPreferences((prev) => ({
                                            ...prev,
                                            enablePush: !prev.enablePush,
                                        }))
                                    }
                                    value={preferences.enablePush}
                                />
                            </View>

                            <View style={styles.preferenceItem}>
                                <Text style={styles.preferenceLabel}>
                                    Notifications par e-mail
                                </Text>
                                <Switch
                                    trackColor={{
                                        false: "#767577",
                                        true: "#9c5fff",
                                    }}
                                    thumbColor={
                                        preferences.enableEmail
                                            ? "#f5dd4b"
                                            : "#f4f3f4"
                                    }
                                    onValueChange={() =>
                                        setPreferences((prev) => ({
                                            ...prev,
                                            enableEmail: !prev.enableEmail,
                                        }))
                                    }
                                    value={preferences.enableEmail}
                                />
                            </View>

                            <View style={styles.preferenceItem}>
                                <Text style={styles.preferenceLabel}>
                                    Désactiver toutes les notifications
                                </Text>
                                <Switch
                                    trackColor={{
                                        false: "#767577",
                                        true: "#9c5fff",
                                    }}
                                    thumbColor={
                                        preferences.muteAll
                                            ? "#f5dd4b"
                                            : "#f4f3f4"
                                    }
                                    onValueChange={() =>
                                        setPreferences((prev) => ({
                                            ...prev,
                                            muteAll: !prev.muteAll,
                                        }))
                                    }
                                    value={preferences.muteAll}
                                />
                            </View>
                        </View>

                        <View style={styles.preferenceSection}>
                            <Text style={styles.sectionTitle}>
                                Préférences par canal
                            </Text>

                            {Object.entries(preferences.channels).map(
                                ([channelId, prefs]) => (
                                    <View
                                        key={channelId}
                                        style={styles.channelPreference}
                                    >
                                        <Text style={styles.channelName}>
                                            {channelId === "channel1"
                                                ? "#general"
                                                : channelId === "channel2"
                                                  ? "#projet-a"
                                                  : channelId === "channel3"
                                                    ? "#design"
                                                    : `#canal-${channelId}`}
                                        </Text>

                                        <View style={styles.preferenceItem}>
                                            <Text
                                                style={styles.preferenceLabel}
                                            >
                                                Mentions
                                            </Text>
                                            <Switch
                                                trackColor={{
                                                    false: "#767577",
                                                    true: "#9c5fff",
                                                }}
                                                thumbColor={
                                                    prefs.mentions
                                                        ? "#f5dd4b"
                                                        : "#f4f3f4"
                                                }
                                                onValueChange={() =>
                                                    setPreferences((prev) => ({
                                                        ...prev,
                                                        channels: {
                                                            ...prev.channels,
                                                            [channelId]: {
                                                                ...prev
                                                                    .channels[
                                                                    channelId
                                                                ],
                                                                mentions:
                                                                    !prev
                                                                        .channels[
                                                                        channelId
                                                                    ].mentions,
                                                            },
                                                        },
                                                    }))
                                                }
                                                value={prefs.mentions}
                                            />
                                        </View>

                                        <View style={styles.preferenceItem}>
                                            <Text
                                                style={styles.preferenceLabel}
                                            >
                                                Tous les messages
                                            </Text>
                                            <Switch
                                                trackColor={{
                                                    false: "#767577",
                                                    true: "#9c5fff",
                                                }}
                                                thumbColor={
                                                    prefs.messages
                                                        ? "#f5dd4b"
                                                        : "#f4f3f4"
                                                }
                                                onValueChange={() =>
                                                    setPreferences((prev) => ({
                                                        ...prev,
                                                        channels: {
                                                            ...prev.channels,
                                                            [channelId]: {
                                                                ...prev
                                                                    .channels[
                                                                    channelId
                                                                ],
                                                                messages:
                                                                    !prev
                                                                        .channels[
                                                                        channelId
                                                                    ].messages,
                                                            },
                                                        },
                                                    }))
                                                }
                                                value={prefs.messages}
                                            />
                                        </View>

                                        <View style={styles.preferenceItem}>
                                            <Text
                                                style={styles.preferenceLabel}
                                            >
                                                Désactiver ce canal
                                            </Text>
                                            <Switch
                                                trackColor={{
                                                    false: "#767577",
                                                    true: "#9c5fff",
                                                }}
                                                thumbColor={
                                                    prefs.muted
                                                        ? "#f5dd4b"
                                                        : "#f4f3f4"
                                                }
                                                onValueChange={() =>
                                                    setPreferences((prev) => ({
                                                        ...prev,
                                                        channels: {
                                                            ...prev.channels,
                                                            [channelId]: {
                                                                ...prev
                                                                    .channels[
                                                                    channelId
                                                                ],
                                                                muted: !prev
                                                                    .channels[
                                                                    channelId
                                                                ].muted,
                                                            },
                                                        },
                                                    }))
                                                }
                                                value={prefs.muted}
                                            />
                                        </View>
                                    </View>
                                ),
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={savePreferences}
                        >
                            <Text style={styles.saveButtonText}>
                                Enregistrer les préférences
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={() => setShowPreferences(true)}
                    >
                        <FontAwesome name="cog" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerButton}
                        onPress={markAllAsRead}
                    >
                        <FontAwesome
                            name="check-circle"
                            size={20}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.uuid}
                contentContainerStyle={styles.list}
                getItemLayout={(data, index) => ({
                    length: 92, // height of notification item + marginBottom (82 + 10)
                    offset: 92 * index,
                    index,
                })}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <FontAwesome name="bell-slash" size={50} color="#666" />
                        <Text style={styles.emptyText}>
                            Aucune notification
                        </Text>
                    </View>
                }
            />

            {renderPreferencesModal()}
        </SafeAreaView>
    );
}
