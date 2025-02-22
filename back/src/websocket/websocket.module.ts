import { Module } from "@nestjs/common";
import { AuthModule } from "src/authentication/authentication.module";
import { WebSocketPool } from "./websocket_pool.gateway";
import { WebSocketAuth } from "./websocket_auth.gateway";
import { MessagesListener } from "./listeners/messages";

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [WebSocketPool, WebSocketAuth, MessagesListener],
})
export class WebSocketModule {}
