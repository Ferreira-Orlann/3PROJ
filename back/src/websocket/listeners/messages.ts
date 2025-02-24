import { OnEvent } from "@nestjs/event-emitter";
import { Events } from "src/events.enum";
import { Message } from "src/messages/messages.entity";
import { WebSocketPool } from "../websocket_pool.gateway";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MessagesListener {
    constructor(private readonly pool: WebSocketPool) {}

    @OnEvent(Events.MESSAGE_CREATED)
    async  handleNewMessage(message: Message) {
        console.log("🔔 Nouvel événement MESSAGE_CREATED :", message);

        if (message.destination_channel) {
            // 🔹 Envoyer le message à tous les utilisateurs du channel
            const sockets = this.pool.getWorkspaceWebsockets(message.destination_channel.uuid);
            if (sockets) {
                sockets.forEach((socket) => {
                    socket.emit("message", message);
                });
            }
        } else if (message.destination_user) {
            // 🔹 Envoyer le message uniquement à l'utilisateur privé concerné
            const userRecord = this.pool.getUserPoolRecord(message.destination_user.uuid);
            if (userRecord) {
                userRecord.socket.emit("message", message);
            }
        }
    }
}
