import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { WebSocketPool } from "./websocket_pool.gateway";
import { WebSocketAuth } from "./forwarder.gateway";
import { MessagesListener } from "./listeners/messages";
import { Test } from "./test";
import { SupGatewayService } from "./supgateway.service";
import { MessagesModule } from "../messages/messages.module";
import { AuthModule } from "../authentication/authentication.module";
import { ReactionsModule } from "../reactions/reactions.module";
import { ReactionsListener } from "./listeners/reactions";
import { MessageHandler } from "./handlers/message.handler";
@Module({
    imports: [AuthModule, MessagesModule, ReactionsModule],
    controllers: [],
    providers: [
        SupGatewayService,
        WebSocketPool,
        WebSocketAuth,
        MessagesListener,
        ReactionsListener,
        MessageHandler,
        Test,
    ],
})
export class WebSocketModule implements OnApplicationBootstrap {
    constructor(private readonly supGatewayService: SupGatewayService) {}

    onApplicationBootstrap() {
        this.supGatewayService.explore();
    }
}
