import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WebSocketPool } from "../websocket_pool.gateway";
import { Reaction } from "../../reactions";
import { Events } from "../../events.enum";

@Injectable()
export class ReactionsListener {
    constructor(private readonly pool: WebSocketPool) {}

    @OnEvent(Events.REACTION_CREATED )
    async handleNewReaction(reaction: Reaction) {
        console.log("�� Nouvelle réaction :", reaction);
        console.log("�� Recherche des WebSockets pour le message :", reaction.message);
        if (reaction.message.destination_channel) {
            console.log("�� Recherche des WebSockets pour le workspace :", reaction.message.destination_channel.workspace.uuid);
            const sockets = this.pool.getWorkspaceWebsockets(
                reaction.message.destination_channel.workspace.uuid
            );
            console.log("📡 Sockets trouvés pour le channel :", sockets);

            if (sockets) {
                sockets.forEach((socket) => {
                    console.log("📤 Envoi de la réaction sur WebSocket :", reaction);
                    socket.emit("reaction", reaction);
                });
            }
        } else if (reaction.message.destination_user) {
            const userRecord = this.pool.getUserPoolRecord(reaction.message.destination_user.uuid);
            if (userRecord) {
                console.log("📤 Envoi de la réaction privée sur WebSocket :", reaction);
                userRecord.socket.emit("reaction", reaction);
            }
        }
    }
}
