import { Module } from "@nestjs/common";
import { WebSocketPool } from "./websocket_pool.gateway";
import { MessagesListener } from "./listeners/messages";
import { MessagesModule } from "../messages/messages.module";
import { AuthModule } from "../authentication/authentication.module";
import { ReactionsModule } from "../reactions/reactions.module";
import { ReactionsListener } from "./listeners/reactions";
import { MessageHandler } from "./handlers/message.handler";
@Module({
    imports: [AuthModule, MessagesModule, ReactionsModule],
    controllers: [],
    providers: [
        WebSocketPool,
        MessagesListener,
        ReactionsListener,
        MessageHandler,
    ],
})
export class WebSocketModule {}
