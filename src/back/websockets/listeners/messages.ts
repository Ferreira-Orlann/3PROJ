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
            console.log("des", message.destination_channel);
            console.log("des", message.destination_channel.workspace.uuid);
            // 🔹 Envoyer le message à tous les utilisateurs du channel
            const sockets = this.pool.getWorkspaceWebsockets(
                message.destination_channel.workspace.uuid,
            );
            console.log("📡 Sockets trouvés pour le channel :", sockets);
            if (sockets) {
                sockets.forEach((socket) => {
                    console.log("📤 Envoi du message sur WebSocket :", message);
                    socket.emit("message", message);
                });
            }
        } else if (message.destination_user) {
            // 🔹 Envoyer le message uniquement à l'utilisateur privé concerné
            const userRecord = this.pool.getUserPoolRecord(
                message.destination_user.uuid,
            );
            console.log(
                "👤 Vérification de la connexion utilisateur :",
                userRecord,
            );
            if (userRecord) {
                console.log(
                    "📤 Envoi du message privé sur WebSocket :",
                    message,
                );
                userRecord.socket.emit("message", message);
            }
        }
    }
}
