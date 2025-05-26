import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "../api/config";
import { UUID } from "crypto";
import { Message } from "../api/endpoints/messages";
import { Reaction } from "../api/endpoints/reactions";

// Import Events enum to match backend events
enum Events {
    MESSAGE_CREATED = "message.created",
    MESSAGE_UPDATED = "message.updated",
    MESSAGE_REMOVED = "message.removed",
    REACTION_CREATED = "reaction.created",
    REACTION_UPDATED = "reaction.updated",
    REACTION_REMOVED = "reaction.removed",
    NOTIFICATION_CREATED = "notification.created",
    NOTIFICATION_READ = "notification.read",
    WORKSPACE_MEMBER_ADDED = "workspace_member.added",
    WORKSPACE_MEMBER_REMOVED = "workspace_member.removed",
    WORKSPACE_CREATED = "workspace_added",
    WORKSPACE_UPDATED = "workspace_updated",
    WORKSPACE_REMOVED = "workspace_removed",
    CHANNEL_CREATED = "channel_added",
    CHANNEL_REMOVED = "channel_removed",
}

// Mapping des événements backend vers les événements mobile
// Mapping des événements backend vers les événements mobile (direction backend -> mobile)
const BACKEND_TO_MOBILE_EVENTS: { [key: string]: string } = {
    [Events.MESSAGE_CREATED]: "message_sent",
    [Events.MESSAGE_UPDATED]: "message_updated",
    [Events.MESSAGE_REMOVED]: "message_removed",
    [Events.REACTION_CREATED]: "reaction_added",
    [Events.REACTION_UPDATED]: "reaction_updated",
    [Events.REACTION_REMOVED]: "reaction_removed",
    [Events.NOTIFICATION_CREATED]: "notification_received",
    [Events.NOTIFICATION_READ]: "notification_read",
    [Events.WORKSPACE_MEMBER_ADDED]: "workspace_member_added",
    [Events.WORKSPACE_MEMBER_REMOVED]: "workspace_member_removed",
    [Events.WORKSPACE_CREATED]: "workspace_created",
    [Events.WORKSPACE_UPDATED]: "workspace_updated",
    [Events.WORKSPACE_REMOVED]: "workspace_removed",
    [Events.CHANNEL_CREATED]: "channel_created",
    [Events.CHANNEL_REMOVED]: "channel_removed",
};

// Mapping des événements mobile vers les événements backend (direction mobile -> backend)
const MOBILE_TO_BACKEND_EVENTS: { [key: string]: string } = {
    "message_sent": Events.MESSAGE_CREATED,
    "message_updated": Events.MESSAGE_UPDATED,
    "message_removed": Events.MESSAGE_REMOVED,
    "reaction_added": Events.REACTION_CREATED,
    "reaction_updated": Events.REACTION_UPDATED,
    "reaction_removed": Events.REACTION_REMOVED,
    "notification_received": Events.NOTIFICATION_CREATED,
    "notification_read": Events.NOTIFICATION_READ,
    "workspace_member_added": Events.WORKSPACE_MEMBER_ADDED,
    "workspace_member_removed": Events.WORKSPACE_MEMBER_REMOVED,
    "workspace_created": Events.WORKSPACE_CREATED,
    "workspace_updated": Events.WORKSPACE_UPDATED,
    "workspace_removed": Events.WORKSPACE_REMOVED,
    "channel_created": Events.CHANNEL_CREATED,
    "channel_removed": Events.CHANNEL_REMOVED,
};

// Mapping combiné pour la compatibilité avec le code existant
const EVENT_MAPPING: { [key: string]: string } = {
    ...BACKEND_TO_MOBILE_EVENTS,
    ...MOBILE_TO_BACKEND_EVENTS
};

type EventCallback = (data: any) => void;

/**
 * Service pour gérer les connexions WebSocket
 */
class WebSocketService {
    private socket: Socket | null = null;
    private token: string | null = null;
    private eventListeners: Map<string, EventCallback[]> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 2000; // 2 secondes

    /**
     * Vérifie si le WebSocket est connecté
     */
    isConnected(): boolean {
        return this.socket !== null && this.socket.connected;
    }
    
    /**
     * Récupère l'instance Socket.IO
     */
    getSocket(): Socket | null {
        return this.socket;
    }
    
    /**
     * Envoie un événement via le WebSocket
     */
    sendEvent(socket: Socket, event: string, payload: any): void {
        if (!socket) {
            console.warn("WebSocket - Impossible d'envoyer un événement: socket non disponible");
            return;
        }

        // Utiliser le bon événement en fonction du type d'événement
        let eventName = event;
        
        // Convertir l'événement si nécessaire
        if (BACKEND_TO_MOBILE_EVENTS[event]) {
            eventName = BACKEND_TO_MOBILE_EVENTS[event];
        }

        console.log(`WebSocket - Envoi de l'événement ${eventName}:`, {
            event: event,
            eventName: eventName,
            payloadType: payload ? typeof payload : "null",
        });

        socket.emit(eventName, {
            message: event,
            data: payload,
        });
    }

    /**
     * Ajoute un écouteur d'événement directement sur la socket
     */
    addSocketListener(event: string, callback: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.on(event, callback);
        } else {
            console.warn(
                "WebSocket - Impossible d'ajouter un écouteur: socket non initialisée",
            );
        }
    }

    /**
     * Supprime un écouteur d'événement de la socket
     */
    removeSocketListener(
        event: string,
        callback?: (...args: any[]) => void,
    ): void {
        if (this.socket) {
            if (callback) {
                this.socket.off(event, callback);
            } else {
                this.socket.off(event);
            }
        }
    }

    /**
     * Initialise la connexion WebSocket
     */
    connect(token: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.socket && this.socket.connected) {
                console.log("WebSocket - Déjà connecté");
                resolve(true);
                return;
            }

            this.token = token;
            console.log(
                "WebSocket - Tentative de connexion avec token:",
                token,
            );

            // URL WebSocket complète pour le débogage
            const wsUrl = API_BASE_URL;
            console.log("WebSocket - Tentative de connexion à l'URL:", wsUrl);

            // Initialiser la connexion Socket.IO
            this.socket = io(wsUrl, {
                extraHeaders: {
                    authorization: `Bearer ${token}`, // Utiliser 'authorization' en minuscules
                },
                auth: {
                    token: `Bearer ${token}`, // Ajouter 'Bearer' au token dans l'objet auth
                },
                transports: ["websocket"],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay,
                forceNew: true, // Forcer une nouvelle connexion
                timeout: 10000, // Augmenter le timeout
            });

            console.log("WebSocket - Headers envoyés:", {
                authorization: `Bearer ${token}`,
                auth: { token: `Bearer ${token}` },
            });

            // Afficher l'ID de la socket pour débogage
            console.log("WebSocket - Socket ID:", this.socket.id);

            // Gérer les événements de connexion
            this.socket.on("connect", () => {
                console.log("WebSocket - Connecté avec succès");
                this.reconnectAttempts = 0;
                resolve(true);
            });

            this.socket.on("connect_error", (error) => {
                console.error("WebSocket - Erreur de connexion:", error);
                this.reconnectAttempts++;
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error(
                        "WebSocket - Nombre maximum de tentatives de reconnexion atteint",
                    );
                    reject(error);
                }
            });

            this.socket.on("disconnect", (reason) => {
                console.log("WebSocket - Déconnecté:", reason);
            });

            // Écouter les messages génériques
            this.socket.on("message", (data) => {
                console.log(
                    "WebSocket - Message reçu (event 'message'):",
                    data,
                );
                // Les données venant du backend sont structurées avec event et payload
                if (data && data.message && data.data) {
                    console.log(
                        "WebSocket - Traitement du message avec event:",
                        data.message,
                    );
                    this.handleEvent(data.message, data.data);
                } else {
                    console.log(
                        "WebSocket - Format de message non reconnu:",
                        data,
                    );
                    // Essayer quand même de traiter le message
                    this.handleEvent("message", data);
                }
            });

            // Écouter spécifiquement l'événement message.created du backend
            this.socket.on("message.created", (data) => {
                console.log(
                    "WebSocket - Message créé reçu (event 'message.created'):",
                    data,
                );
                this.handleEvent("message", data);
                this.handleEvent("message_sent", data);
            });

            // Écouter les événements spécifiques aux réactions
            this.socket.on("reaction", (data) => {
                console.log("WebSocket - Nouvelle réaction reçue:", data);
                this.handleEvent("reaction_added", data);
            });

            this.socket.on("reaction_updated", (data) => {
                console.log("WebSocket - Réaction mise à jour reçue:", data);
                this.handleEvent("reaction_updated", data);
            });

            this.socket.on("reaction_removed", (data) => {
                console.log("WebSocket - Réaction supprimée reçue:", data);
                this.handleEvent("reaction_removed", data);
            });
            
            // Écouter les événements de notification
            this.socket.on("notification", (data) => {
                console.log("WebSocket - Notification reçue:", data);
                this.handleEvent("notification_received", data);
            });
            
            this.socket.on("notification.created", (data) => {
                console.log("WebSocket - Nouvelle notification créée:", data);
                this.handleEvent("notification_received", data);
            });
            
            this.socket.on("notification.read", (data) => {
                console.log("WebSocket - Notification lue:", data);
                this.handleEvent("notification_read", data);
            });
            
            // Écouter les événements de workspace
            this.socket.on("workspace_member.added", (data) => {
                console.log("WebSocket - Membre ajouté à l'espace de travail:", data);
                this.handleEvent("workspace_member_added", data);
            });
            
            this.socket.on("workspace_member.removed", (data) => {
                console.log("WebSocket - Membre retiré de l'espace de travail:", data);
                this.handleEvent("workspace_member_removed", data);
            });
            
            // Écouter les événements de channel
            this.socket.on("channel_added", (data) => {
                console.log("WebSocket - Canal ajouté:", data);
                this.handleEvent("channel_created", data);
            });
            
            this.socket.on("channel_removed", (data) => {
                console.log("WebSocket - Canal supprimé:", data);
                this.handleEvent("channel_removed", data);
            });
        });
    }

    /**
     * Se déconnecter du WebSocket
     */
    disconnect(): void {
        if (this.socket) {
            console.log("WebSocket - Déconnexion");
            this.socket.disconnect();
            this.socket = null;
            this.token = null;
            this.eventListeners.clear();
        }
    }

    /**
     * S'abonner à un événement
     * Supporte à la fois les noms d'événements backend et mobile
     */
    on(event: string, callback: EventCallback): () => void {
        console.log(`WebSocket - Abonnement à l'événement: ${event}`);

        // S'abonner à l'événement spécifié
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }

        const listeners = this.eventListeners.get(event);
        listeners?.push(callback);

        // S'abonner également à l'événement mappé si différent
        const mappedEvent = EVENT_MAPPING[event];
        if (mappedEvent && mappedEvent !== event) {
            console.log(
                `WebSocket - Abonnement croisé à l'événement mappé: ${mappedEvent}`,
            );

            if (!this.eventListeners.has(mappedEvent)) {
                this.eventListeners.set(mappedEvent, []);
            }

            const mappedListeners = this.eventListeners.get(mappedEvent);
            mappedListeners?.push(callback);
        }

        // Retourner une fonction pour se désabonner
        return () => {
            this.off(event, callback);
        };
    }

    /**
     * Se désabonner d'un événement spécifique
     * Supporte à la fois les noms d'événements backend et mobile
     */
    off(event: string, callback: EventCallback): void {
        console.log(`WebSocket - Désabonnement de l'événement: ${event}`);

        // Récupérer les listeners pour cet événement
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            // Désabonner de l'événement principal
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }

        // Désabonner également de l'événement mappé si différent
        const mappedEvent = EVENT_MAPPING[event];
        if (mappedEvent && mappedEvent !== event) {
            const mappedListeners = this.eventListeners.get(mappedEvent);
            if (mappedListeners) {
                const mappedIndex = mappedListeners.indexOf(callback);
                if (mappedIndex !== -1) {
                    mappedListeners.splice(mappedIndex, 1);
                }
            }
        }
    }

    /**
     * Envoyer un message via WebSocket
     */
    send(event: string, data: any): boolean {
        if (!this.socket || !this.socket.connected) {
            console.error(
                "WebSocket - Impossible d'envoyer un message: non connecté",
            );
            return false;
        }

        console.log(`WebSocket - Envoi d'un message: ${event}`, data);

        // Mapper l'événement mobile vers l'événement backend si nécessaire
        const backendEvent = EVENT_MAPPING[event] || event;

        // Format attendu par le backend: { message: event, data: payload }
        this.socket.emit("message", {
            message: backendEvent,
            data: data,
        });

        // Déclencher l'événement localement pour mise à jour immédiate de l'UI
        this.handleEvent(event, data);

        return true;
    }

    /**
     * Alias pour send - pour compatibilité avec l'API Socket.io
     */
    emit(event: string, data: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                const result = this.send(event, data);
                resolve(result);
            } catch (error) {
                console.error(
                    `WebSocket - Erreur lors de l'envoi de l'événement ${event}:`,
                    error,
                );
                reject(error);
            }
        });
    }

    /**
     * Gérer un événement reçu
     */
    private handleEvent(event: string, data: any): void {
        console.log(`WebSocket - Traitement de l'événement: ${event}`, data);

        // Notifier tous les listeners pour cet événement
        const listeners = this.eventListeners.get(event);
        if (listeners && listeners.length > 0) {
            console.log(
                `WebSocket - ${listeners.length} listeners trouvés pour l'événement ${event}`,
            );
            listeners.forEach((callback, index) => {
                try {
                    console.log(
                        `WebSocket - Exécution du callback #${index + 1} pour l'événement ${event}`,
                    );
                    callback(data);
                } catch (error) {
                    console.error(
                        `WebSocket - Erreur dans le callback #${index + 1} pour l'événement ${event}:`,
                        error,
                    );
                }
            });
        } else {
            console.log(
                `WebSocket - Aucun listener pour l'événement: ${event}`,
            );
        }

        // Notifier également les listeners pour l'événement mappé si différent
        const mappedEvent = EVENT_MAPPING[event];
        if (mappedEvent && mappedEvent !== event) {
            const mappedListeners = this.eventListeners.get(mappedEvent);
            if (mappedListeners && mappedListeners.length > 0) {
                mappedListeners.forEach((callback) => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(
                            `WebSocket - Erreur dans le callback pour l'événement mappé ${mappedEvent}:`,
                            error,
                        );
                    }
                });
            }
        }
    }

    /**
     * Envoyer un message à un canal
     */
    sendMessageToChannel(channelUuid: UUID, content: string): boolean {
        return this.send("message_sent", {
            destination_channel: channelUuid,
            message: content,
            is_public: true,
        });
    }

    /**
     * Envoyer un message privé à un utilisateur
     */
    sendDirectMessage(userUuid: UUID, content: string): boolean {
        return this.send("message_sent", {
            destination_user: userUuid,
            message: content,
            is_public: false,
        });
    }
}

// Exporter une instance singleton
export default new WebSocketService();
