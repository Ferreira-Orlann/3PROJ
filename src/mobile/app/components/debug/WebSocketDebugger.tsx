import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import WebSocketService from "../../services/websocket/websocket.service";
import { useAuth } from "../../context/AuthContext";

/**
 * Composant pour déboguer les événements WebSocket
 */
const WebSocketDebugger = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const { token } = useAuth();

    useEffect(() => {
        // Fonction pour ajouter un log
        const addLog = (message: string) => {
            const timestamp = new Date().toLocaleTimeString();
            setLogs((prev) => [...prev, `${timestamp}: ${message}`].slice(-50)); // Garder seulement les 50 derniers logs
        };

        // Vérifier la connexion
        if (WebSocketService.isConnected()) {
            setIsConnected(true);
            addLog("WebSocket déjà connecté");
        } else if (token) {
            addLog("Tentative de connexion WebSocket...");
            WebSocketService.connect(token)
                .then(() => {
                    setIsConnected(true);
                    addLog("WebSocket connecté avec succès");
                })
                .catch((err) => {
                    addLog(`Erreur de connexion: ${err.message}`);
                });
        }

        // Écouter les événements WebSocket pour le débogage
        const onConnect = () => {
            setIsConnected(true);
            addLog("WebSocket connecté");
        };

        const onDisconnect = (reason: string) => {
            setIsConnected(false);
            addLog(`WebSocket déconnecté: ${reason}`);
        };

        const onConnectError = (error: Error) => {
            addLog(`Erreur de connexion: ${error.message}`);
        };

        const onMessage = (data: any) => {
            addLog(
                `Message reçu: ${JSON.stringify(data).substring(0, 100)}...`,
            );
        };

        // Ajouter des écouteurs d'événements
        WebSocketService.addSocketListener("connect", onConnect);
        WebSocketService.addSocketListener("disconnect", onDisconnect);
        WebSocketService.addSocketListener("connect_error", onConnectError);
        WebSocketService.addSocketListener("message", onMessage);
        WebSocketService.addSocketListener("message.created", (data) =>
            addLog(
                `message.created: ${JSON.stringify(data).substring(0, 100)}...`,
            ),
        );
        WebSocketService.addSocketListener("message_sent", (data) =>
            addLog(
                `message_sent: ${JSON.stringify(data).substring(0, 100)}...`,
            ),
        );

        return () => {
            // Nettoyer les écouteurs d'événements
            WebSocketService.removeSocketListener("connect", onConnect);
            WebSocketService.removeSocketListener("disconnect", onDisconnect);
            WebSocketService.removeSocketListener(
                "connect_error",
                onConnectError,
            );
            WebSocketService.removeSocketListener("message", onMessage);
            WebSocketService.removeSocketListener("message.created");
            WebSocketService.removeSocketListener("message_sent");
        };
    }, [token]);

    // Si le composant n'est pas visible, afficher seulement un bouton flottant
    if (!isVisible) {
        return (
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => setIsVisible(true)}
            >
                <Text style={styles.floatingButtonText}>
                    WS {isConnected ? "🟢" : "🔴"}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>WebSocket Debugger</Text>
                <Text
                    style={[
                        styles.status,
                        isConnected ? styles.connected : styles.disconnected,
                    ]}
                >
                    {isConnected ? "Connecté" : "Déconnecté"}
                </Text>
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsVisible(false)}
                >
                    <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.logContainer}>
                {logs.map((log, index) => (
                    <Text key={index} style={styles.logText}>
                        {log}
                    </Text>
                ))}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        if (token) {
                            WebSocketService.connect(token)
                                .then(() =>
                                    setLogs((prev) => [
                                        ...prev,
                                        "Reconnexion réussie",
                                    ]),
                                )
                                .catch((err) =>
                                    setLogs((prev) => [
                                        ...prev,
                                        `Erreur: ${err.message}`,
                                    ]),
                                );
                        }
                    }}
                >
                    <Text style={styles.buttonText}>Reconnecter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={() => setLogs([])}
                >
                    <Text style={styles.buttonText}>Effacer logs</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 80,
        right: 10,
        width: 300,
        height: 400,
        backgroundColor: "#1E1E1E",
        borderRadius: 10,
        padding: 10,
        zIndex: 1000,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    status: {
        fontSize: 14,
        fontWeight: "bold",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    connected: {
        color: "#4CAF50",
    },
    disconnected: {
        color: "#F44336",
    },
    closeButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#333333",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    logContainer: {
        flex: 1,
        backgroundColor: "#121212",
        borderRadius: 5,
        padding: 5,
        marginBottom: 10,
    },
    logText: {
        color: "#CCCCCC",
        fontSize: 10,
        fontFamily: "monospace",
        marginBottom: 2,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        backgroundColor: "#2196F3",
        borderRadius: 5,
        padding: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: "center",
    },
    clearButton: {
        backgroundColor: "#FF9800",
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    floatingButton: {
        position: "absolute",
        bottom: 80,
        right: 10,
        backgroundColor: "#1E1E1E",
        borderRadius: 20,
        padding: 10,
        zIndex: 1000,
    },
    floatingButtonText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
});

export default WebSocketDebugger;
