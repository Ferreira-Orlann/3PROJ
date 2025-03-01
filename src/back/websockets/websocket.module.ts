import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { WebSocketPool } from "./websocket_pool.gateway";
import { WebSocketAuth } from "./forwarder.gateway";
import { MessagesListener } from "./listeners/messages";
import { Test } from "./test";
import { SupGatewayService } from "./supgateway.service";
import { MessagesModule } from "../messages";
import { AuthModule } from "../authentication";
@Module({
    imports: [AuthModule, MessagesModule],
    controllers: [],
    providers: [
        SupGatewayService,
        WebSocketPool,
        WebSocketAuth,
        MessagesListener,
        Test,
    ],
})
export class WebSocketModule implements OnApplicationBootstrap {
    constructor(private readonly supGatewayService: SupGatewayService) {}

    onApplicationBootstrap() {
        this.supGatewayService.explore();
    }
}
