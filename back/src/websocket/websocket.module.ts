import { Module } from "@nestjs/common";
import { AuthModule } from "src/authentication/auth.module";
import { WebSocketPool } from "./websocket_pool.gateway";
import { WebSocketAuth } from "./websocket_auth.gateway";

@Module({
    imports: [AuthModule],
    controllers: [],
    providers: [WebSocketPool, WebSocketAuth],
})
export class WebSocketModule {}
