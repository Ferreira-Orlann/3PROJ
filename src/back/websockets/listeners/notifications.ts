import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WebSocketPool } from "../websocket_pool.gateway";
import { Notification } from "../../notifications/notification.entity";
import { Events } from "../../events.enum";

@Injectable()
export class NotificationsListener {
    constructor(private readonly pool: WebSocketPool) {}

    @OnEvent(Events.NOTIFICATION_CREATED)
    async handleNewNotification(notification: Notification) {
        console.log("🔔 Nouvelle notification créée:", notification);
        const recipientRecord = this.pool.getUserPoolRecord(notification.recipient.uuid);
        
        if (recipientRecord) {
            // Utiliser la méthode sendEvent pour envoyer la notification
            this.pool.sendEvent(recipientRecord.socket, Events.NOTIFICATION_CREATED, {
                notification,
                timestamp: new Date(),
            });
            
            // Émettre également un événement spécifique pour la notification
            recipientRecord.socket.emit("notification.created", {
                notification,
                timestamp: new Date(),
            });
        }
    }

    @OnEvent(Events.NOTIFICATION_READ)
    async handleNotificationRead(notification: Notification) {
        console.log("👁️ Notification marquée comme lue:", notification);
        const recipientRecord = this.pool.getUserPoolRecord(notification.recipient.uuid);
        
        if (recipientRecord) {
            // Utiliser la méthode sendEvent pour envoyer la notification
            this.pool.sendEvent(recipientRecord.socket, Events.NOTIFICATION_READ, {
                notification,
                timestamp: new Date(),
            });
            
            // Émettre également un événement spécifique pour la notification
            recipientRecord.socket.emit("notification.read", {
                notification,
                timestamp: new Date(),
            });
        }
    }
}
