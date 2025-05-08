import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
    GestureResponderEvent,
    PanResponderGestureState,
    ActivityIndicator,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import useHomeScreen from "../../hooks/home";
import useDirectMessages, { DirectMessageUser } from "../../hooks/useDirectMessages";
import { UUID } from "crypto";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const router = useRouter();
    const auth = useAuth();
    const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(
        null,
    );
    const [channelHeights] = useState<{ [key: string]: Animated.Value }>({});
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Utiliser le hook useHomeScreen pour récupérer les workspaces
    const { state, filteredWorkspaces } = useHomeScreen();
    
    // Utiliser le hook useDirectMessages pour récupérer les conversations privées
    const { state: dmState, refreshDirectMessages } = useDirectMessages();

    // Animation values
    const sidebarWidth = useRef(new Animated.Value(60)).current; // Largeur initiale réduite
    const screenWidth = Dimensions.get("window").width;
    const expandedWidth = Math.min(220, screenWidth * 0.7); // Largeur maximale de la sidebar

    // Extract workspace ID and channel ID from pathname if they exist
    const pathWorkspaceId =
        pathname.match(/\/screens\/workspaces\/([^/]+)/)?.[1] || null;

    // Configure PanResponder for swipe gestures
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Détecter les mouvements horizontaux significatifs
                return (
                    Math.abs(gestureState.dx) > 10 &&
                    Math.abs(gestureState.dy) < 50
                );
            },
            onPanResponderGrant: () => {
                // Début du geste
            },
            onPanResponderMove: (_, gestureState) => {
                // Si on swipe de gauche à droite près du bord gauche de l'écran
                if (gestureState.moveX < 50 && gestureState.dx > 20) {
                    expandSidebar();
                }
                // Si on swipe de droite à gauche quand la sidebar est ouverte
                else if (isExpanded && gestureState.dx < -20) {
                    collapseSidebar();
                }
            },
            onPanResponderRelease: () => {
                // Fin du geste
            },
        }),
    ).current;

    // Ajouter un gestionnaire de toucher pour l'indicateur de glissement
    const handleSwipeIndicatorPress = () => {
        if (isExpanded) {
            collapseSidebar();
        } else {
            expandSidebar();
        }
    };

    // Initialize animation values for each workspace
    useEffect(() => {
        // Si nous avons des workspaces, initialiser les animations
        if (
            filteredWorkspaces &&
            Array.isArray(filteredWorkspaces) &&
            filteredWorkspaces.length > 0
        ) {
            filteredWorkspaces.forEach((workspace) => {
                // Vérifier que workspace est défini
                if (workspace) {
                    console.log("Workspacessss:", workspace);
                    try {
                        // Utiliser une méthode sûre pour obtenir l'ID avec vérification complète des valeurs null/undefined
                        let id = null;

                        if (workspace.uuid) {
                            id = String(workspace.uuid);
                        } else if (workspace.workspaceId) {
                            id = String(workspace.workspaceId);
                        } else if (workspace.id) {
                            id = String(workspace.id);
                        }

                        // Vérifier que l'ID est défini avant de l'utiliser
                        if (id && !channelHeights[id]) {
                            channelHeights[id] = new Animated.Value(0);
                        }
                    } catch (error) {
                        console.error("Error processing workspace ID:", error);
                    }
                }
            });
        }

        // If there's a workspace in the path, expand it
        if (pathWorkspaceId && pathWorkspaceId !== expandedWorkspace) {
            setExpandedWorkspace(pathWorkspaceId);
        }
    }, [pathWorkspaceId, filteredWorkspaces]);

    // Function to expand the sidebar
    const expandSidebar = () => {
        setIsExpanded(true);
        Animated.spring(sidebarWidth, {
            toValue: expandedWidth,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    };

    // Function to collapse the sidebar
    const collapseSidebar = () => {
        setIsExpanded(false);
        Animated.spring(sidebarWidth, {
            toValue: 20,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    };

    // Utiliser les messages directs déjà définis plus haut
    // Éviter la duplication de SAMPLE_DMS

    // Effet pour détecter les changements de route et réduire la sidebar si nécessaire
    useEffect(() => {
        // Si on est sur mobile, réduire la sidebar lors d'un changement de route
        if (Dimensions.get("window").width < 768) {
            collapseSidebar();
        }
    }, [pathname]);

    // Handle workspace selection
    const handleWorkspaceSelect = (workspaceId: UUID) => {
        // Rediriger vers la page dédiée du workspace
        router.push({
            pathname: "/screens/workspaces/[id]",
            params: { id: workspaceId },
        });
        // Optionally collapse sidebar after selection on mobile
        if (Dimensions.get("window").width < 768) {
            collapseSidebar();
        }
    };
    
    // Handle direct message selection
    const handleDirectMessageSelect = (userId: UUID) => {
        // Rediriger vers la page de conversation privée
        // Utiliser un chemin existant pour le moment, nous créerons la page de messages directs plus tard
        router.push({
            pathname: "/screens/direct-messages",
            params: { userId: userId.toString() },
        });
        // Optionally collapse sidebar after selection on mobile
        if (Dimensions.get("window").width < 768) {
            collapseSidebar();
        }
    };

    return (
        <Animated.View
            style={[styles.container, { width: sidebarWidth }]}
            {...panResponder.panHandlers}
        >
            {/* Workspaces Section */}
            <View style={[styles.section, { paddingTop: insets.top }]}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Espaces de travail</Text>
                </View>
                <ScrollView style={styles.scrollSection}>
                    {state.isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                size="small"
                                color={Colors.primary}
                            />
                            <Text style={styles.loadingText}>
                                Chargement...
                            </Text>
                        </View>
                    ) : state.error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{state.error}</Text>
                        </View>
                    ) : filteredWorkspaces.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Aucun espace de travail
                            </Text>
                        </View>
                    ) : (
                        filteredWorkspaces.map((workspace) => {
                            // Utiliser uuid si disponible, sinon workspaceId (pour compatibilité)
                            const workspaceId =
                                (workspace as any).uuid ||
                                workspace.workspaceId;
                            return (
                                <View key={workspaceId}>
                                    <TouchableOpacity
                                        style={[
                                            styles.workspaceItem,
                                            pathWorkspaceId === workspaceId &&
                                                styles.selectedItem,
                                        ]}
                                        onPress={() =>
                                            handleWorkspaceSelect(workspaceId)
                                        }
                                    >
                                        <View style={styles.workspaceAvatar}>
                                            <Text style={styles.avatarText}>
                                                {workspace.name[0]}
                                            </Text>
                                        </View>
                                        {isExpanded && (
                                            <View style={styles.workspaceInfo}>
                                                <Text
                                                    style={styles.workspaceName}
                                                >
                                                    {workspace.name}
                                                </Text>
                                                <View
                                                    style={
                                                        styles.workspaceStatus
                                                    }
                                                >
                                                    <View
                                                        style={[
                                                            styles.statusDot,
                                                            {
                                                                backgroundColor:
                                                                    workspace.is_public
                                                                        ? "#43b581"
                                                                        : "#faa61a",
                                                            },
                                                        ]}
                                                    />
                                                    <Text
                                                        style={
                                                            styles.statusText
                                                        }
                                                    >
                                                        {workspace.is_public
                                                            ? "Public"
                                                            : "Privé"}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                        {isExpanded && (
                                            <Ionicons
                                                name="chevron-forward-outline"
                                                size={16}
                                                color="#8e9297"
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </View>

            {/* Direct Messages Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Messages directs</Text>
                </View>
                <ScrollView style={styles.scrollSection}>
                    {dmState.isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator
                                size="small"
                                color={Colors.primary}
                            />
                            <Text style={styles.loadingText}>
                                Chargement...
                            </Text>
                        </View>
                    ) : dmState.error ? (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{dmState.error}</Text>
                        </View>
                    ) : dmState.users.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Aucune conversation privée
                            </Text>
                        </View>
                    ) : (
                        dmState.users.map((user) => (
                            <TouchableOpacity
                                key={user.uuid.toString()}
                                style={styles.directMessageItem}
                                onPress={() => handleDirectMessageSelect(user.uuid)}
                            >
                                <View style={styles.userAvatar}>
                                    <Text style={styles.avatarText}>
                                        {user.username[0]}
                                    </Text>
                                </View>
                                {isExpanded && (
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>
                                            {user.username}
                                        </Text>
                                        {user.lastMessage && (
                                            <Text style={styles.lastMessage} numberOfLines={1}>
                                                {user.lastMessage}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Indicateur de glissement */}
            <TouchableOpacity
                style={styles.swipeIndicator}
                onPress={handleSwipeIndicatorPress}
            ></TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "#111643",
    },
    container: {
        backgroundColor: "#1e2124",
        height: "100%",
        borderRightWidth: 1,
        borderRightColor: "#2f3136",
        position: "absolute",
        zIndex: 1,
        overflow: "hidden",
    },
    directMessageItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        marginVertical: 2,
        borderRadius: 4,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#5865F2", // Couleur bleue pour les avatars des messages directs
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    userInfo: {
        flex: 1,
        justifyContent: "center",
    },
    userName: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
    },
    lastMessage: {
        color: "#8e9297",
        fontSize: 12,
        marginTop: 2,
    },
    loadingContainer: {
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    loadingText: {
        color: "#8e9297",
        fontSize: 12,
        marginTop: 8,
    },
    errorContainer: {
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    errorText: {
        color: "#f04747",
        fontSize: 12,
    },
    emptyContainer: {
        padding: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        color: "#8e9297",
        fontSize: 12,
    },
    swipeIndicator: {
        position: "absolute",
        height: "100%",
        right: 0,
        backgroundColor: "rgba(32, 34, 37, 0.8)",
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
        padding: 8,
        transform: [{ translateY: -15 }],

        elevation: 5,
    },
    workspaceHeader: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#2f3136",
    },
    workspaceTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    workspaceSubtitle: {
        color: "#8e9297",
        fontSize: 12,
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#2f3136",
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        color: "#8e9297",
        fontSize: 12,
        textTransform: "uppercase",
        opacity: 1,
    },
    scrollSection: {
        maxHeight: 300,
    },
    workspaceItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    selectedItem: {
        backgroundColor: "rgba(79, 84, 92, 0.32)",
    },
    workspaceAvatar: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    workspaceInfo: {
        flex: 1,
    },
    workspaceName: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    workspaceStatus: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    channelItem: {
        paddingVertical: 6,
    },
    channelText: {
        color: "#8e9297",
        fontSize: 14,
    },
    dmItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: "#fff",
        fontSize: 14,
    },
    userStatus: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    statusText: {
        color: "#8e9297",
        fontSize: 10,
        marginLeft: 4,
    },
    channelsContainer: {
        marginLeft: 20,
        marginTop: 4,
        marginBottom: 8,
    },
    menuItems: {
        padding: 16,
        marginTop: "auto",
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
    },
    menuItemText: {
        color: "#fff",
        marginLeft: 12,
        fontSize: 14,
    },
});
