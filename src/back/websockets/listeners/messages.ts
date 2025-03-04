import { OnEvent } from "@nestjs/event-emitter";
import { Events } from "../../events.enum";
import { Message } from "../../messages/messages.entity";
import { WebSocketPool } from "../websocket_pool.gateway";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessagesListener {
    constructor(private readonly pool: WebSocketPool) {}

    @OnEvent(Events.MESSAGE_CREATED)
    async handleNewMessage(message: Message) {
        if (message.destination_channel) {
            const sockets = this.pool.getWorkspaceWebsockets(
                message.destination_channel.workspace.uuid,
            );
            if (sockets) {
                sockets.forEach((socket) => {
                    socket.emit("message", message);
                });
            }
        } else if (message.destination_user) {
            const userRecord = this.pool.getUserPoolRecord(
                message.destination_user.uuid,
            );

            if (userRecord) {
                userRecord.socket.emit("message", message);
            }
        }

        if (message.source) {
        console.log("🔔 Notifier l'expéditeur :", message.source.uuid);

        const senderSocket = this.pool.getUserPoolRecord(message.source.uuid);
            if (senderSocket) {
                senderSocket.socket.emit("message_sent", {
                    message,
                    status: "delivered",
                    timestamp: new Date(),
                });
            }
        }
    }

    @OnEvent(Events.MESSAGE_UPDATED)
    async handleUpdatedMessage(message: Message) {
    console.log("📝 Message mis à jour :", message);

    if (message.destination_channel) {
        const sockets = this.pool.getWorkspaceWebsockets(message.destination_channel.workspace.uuid);
        sockets?.forEach((socket) => socket.emit("message_updated", message));
    } else if (message.destination_user) {
        const userRecord = this.pool.getUserPoolRecord(message.destination_user.uuid);
        userRecord?.socket.emit("message_updated", message);
    }

    if (message.source) {
        const senderSocket = this.pool.getUserPoolRecord(message.source.uuid);
        senderSocket?.socket.emit("message_update_confirmed", {
            message,
            status: "updated",
            timestamp: new Date(),
        });
    }
    }

    @OnEvent(Events.MESSAGE_REMOVED)
    async handleDeletedMessage(message: Message) {
        console.log("🗑 Message supprimé :", message);
     if (message.destination_channel) {
        const sockets = this.pool.getWorkspaceWebsockets(message.destination_channel.workspace.uuid);
        sockets?.forEach((socket) => socket.emit("message_removed", { messageId: message.uuid }));
     } else if (message.destination_user) {
        const userRecord = this.pool.getUserPoolRecord(message.destination_user.uuid);
        userRecord?.socket.emit("message_removed", { messageId: message.uuid });
     }

    if (message.source) {
        const senderSocket = this.pool.getUserPoolRecord(message.source.uuid);
        senderSocket?.socket.emit("message_remove_confirmed", {
            messageUuid: message.uuid,
            status: "removed",
            timestamp: new Date(),
        });
    }
}



}
