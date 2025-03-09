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
                    this.pool.sendEvent(socket, Events.MESSAGE_CREATED, message)
                });
            }
        } else if (message.destination_user) {
            const userRecord = this.pool.getUserPoolRecord(
                message.destination_user.uuid,
            );

            if (userRecord) {
                this.pool.sendEvent(userRecord.socket, Events.MESSAGE_CREATED, message)
            }
        }
    }

    @OnEvent(Events.MESSAGE_UPDATED)
    async handleUpdatedMessage(message: Message) {
        console.log("📝 Message mis à jour :", message);
        if (message.destination_channel) {
            const sockets = this.pool.getWorkspaceWebsockets(message.destination_channel.workspace.uuid);
            sockets?.forEach((socket) => this.pool.sendEvent(socket, Events.MESSAGE_UPDATED, message));
        } else if (message.destination_user) {
            const userRecord = this.pool.getUserPoolRecord(message.destination_user.uuid);
            this.pool.sendEvent(userRecord?.socket, Events.MESSAGE_UPDATED, message)
        }
    }

    @OnEvent(Events.MESSAGE_REMOVED)
    async handleDeletedMessage(message: Message) {
        console.log("🗑 Message supprimé :", message);
        if (message.destination_channel) {
            const sockets = this.pool.getWorkspaceWebsockets(message.destination_channel.workspace.uuid);
            sockets?.forEach((socket) => this.pool.sendEvent(socket, Events.MESSAGE_REMOVED, { messageId: message.uuid }));
            
        } else if (message.destination_user) {
            const userRecord = this.pool.getUserPoolRecord(message.destination_user.uuid);
            this.pool.sendEvent(userRecord?.socket, Events.MESSAGE_REMOVED, { messageId: message.uuid })
        }
    }
}
