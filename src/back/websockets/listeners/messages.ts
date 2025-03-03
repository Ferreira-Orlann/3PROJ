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
}
