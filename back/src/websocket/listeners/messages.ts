import { OnEvent } from "@nestjs/event-emitter";
import { Events } from "src/events.enum";
import { Message } from "src/messages/messages.entity";
import { WebSocketPool } from "../websocket_pool.gateway";

export class MessagesListener {
    constructor(private readonly pool: WebSocketPool) {}

    @OnEvent(Events.MESSAGE_CREATED)
    created(message: Message) {}
}
