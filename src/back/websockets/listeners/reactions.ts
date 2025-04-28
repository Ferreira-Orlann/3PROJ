import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { WebSocketPool } from "../websocket_pool.gateway";
import { Reaction } from "../../reactions/reactions.entity";
import { Events } from "../../events.enum";

@Injectable()
export class ReactionsListener {
    constructor(private readonly pool: WebSocketPool) {}

    @OnEvent(Events.REACTION_CREATED)
    async handleNewReaction(reaction: Reaction) {
        console.log("Created");
        console.log("�� Nouvelle réaction :", reaction);
        console.log(
            "�� Recherche des WebSockets pour le message :",
            reaction.message,
        );
        if (reaction.message.destination_channel) {
            console.log(
                "�� Recherche des WebSockets pour le workspace :",
                reaction.message.destination_channel.workspace.uuid,
            );
            const sockets = this.pool.getWorkspaceWebsockets(
                reaction.message.destination_channel.workspace.uuid,
            );
            console.log("📡 Sockets trouvés pour le channel :", sockets);

            if (sockets) {
                sockets.forEach((socket) => {
                    console.log(
                        "📤 Envoi de la réaction sur WebSocket :",
                        reaction,
                    );
                    socket.emit("reaction", reaction);
                });
            }
        } else if (reaction.message.destination_user) {
            const userRecord = this.pool.getUserPoolRecord(
                reaction.message.destination_user.uuid,
            );
            if (userRecord) {
                console.log(
                    "📤 Envoi de la réaction privée sur WebSocket :",
                    reaction,
                );
                userRecord.socket.emit("reaction", reaction);
            }
        }

        if (reaction.user.uuid) {
            console.log("🔔 Notifier l'expéditeur :", reaction.user.uuid);
            const senderSocket = this.pool.getUserPoolRecord(
                reaction.user.uuid,
            );
            if (senderSocket) {
                senderSocket.socket.emit("reaction_sent", {
                    reaction,
                    status: "delivered",
                    timestamp: new Date(),
                });
            }
        }
    }

    @OnEvent(Events.REACTION_UPDATED)
    async handleUpdatedReaction(reaction: Reaction) {
        console.log("Reaction mise à jour :", reaction.message);
        if (reaction.message.destination_channel) {
            console.log("�� reaction :", reaction.message.destination_channel);
            const sockets = this.pool.getWorkspaceWebsockets(
                reaction.message.destination_channel.workspace.uuid,
            );
            console.log("📝 reaction :", sockets);
            sockets?.forEach((socket) =>
                socket.emit("reaction_updated", reaction),
            );
        } else if (reaction.message.destination_user) {
            console.log("reaction dest ", reaction.message.destination_user);
            const userRecord = this.pool.getUserPoolRecord(
                reaction.message.destination_user.uuid,
            );
            console.log(" reactionUserDest :", userRecord);
            userRecord?.socket.emit("reaction_updated", reaction);
        }

        if (reaction.user.uuid) {
            console.log("📝 reactionUser :", reaction.user.uuid);
            const senderSocket = this.pool.getUserPoolRecord(
                reaction.user.uuid,
            );
            console.log(" reactionUserSender :", senderSocket);
            if (senderSocket) {
                senderSocket.socket.emit("reaction_update_confirmed", {
                    reaction,
                    status: "updated",
                    timestamp: new Date(),
                });
            }
        }
    }

    @OnEvent(Events.REACTION_REMOVED)
    async handleDeletedReaction(reaction: Reaction) {
        console.log("🗑 Reaction supprimé :", reaction);

        if (reaction.message.destination_channel) {
            const sockets = this.pool.getWorkspaceWebsockets(
                reaction.message.destination_channel.workspace.uuid,
            );
            sockets?.forEach((socket) =>
                socket.emit("reaction_removed", {
                    reactionUuid: reaction.uuid,
                }),
            );
        } else if (reaction.message.destination_user) {
            const userRecord = this.pool.getUserPoolRecord(
                reaction.message.destination_user.uuid,
            );
            userRecord?.socket.emit("reaction_removed", {
                reactionUuid: reaction.uuid,
            });
        }

        // ✅ Notifier l'expéditeur que la suppression a bien eu lieu
        if (reaction.user) {
            const senderSocket = this.pool.getUserPoolRecord(
                reaction.user.uuid,
            );
            senderSocket?.socket.emit("reaction_remove_confirmed", {
                reactionUuid: reaction.uuid,
                status: "removed",
                timestamp: new Date(),
            });
        }
    }
}
