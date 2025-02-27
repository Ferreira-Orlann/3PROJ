import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { AuthModule } from "src/authentication/authentication.module";
import { WebSocketPool } from "./websocket_pool.gateway";
import { WebSocketAuth } from "./forwarder.gateway";
import { MessagesModule } from "src/messages/messages.module";
import { ReactionsModule } from "src/reactions/reactions.module";
import { MessagesListener } from "./listeners/messages";
import { Test } from "./test";
import { SupGatewayService } from "./supgateway.service";
import { ReactionsListener } from "./listeners/reactions";
@Module({
    imports: [AuthModule, MessagesModule, ReactionsModule],
    controllers: [],
    providers: [SupGatewayService, WebSocketPool, WebSocketAuth, MessagesListener,ReactionsListener, Test],
})
export class WebSocketModule implements OnApplicationBootstrap {
    constructor(private readonly supGatewayService: SupGatewayService) {}

    onApplicationBootstrap() {
        this.supGatewayService.explore()
    }
}