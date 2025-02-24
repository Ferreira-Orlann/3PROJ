import { Module } from "@nestjs/common";
import { AuthModule } from "src/authentication/authentication.module";
import { WebSocketPool } from "./websocket_pool.gateway";
import { WebSocketAuth } from "./websocket_auth.gateway";
import { MessagesModule } from "src/messages/messages.module";
import { MessagesListener } from "./listeners/messages";
import { MessagesService } from "../messages/messages.service";
import { GraphInspector, MetadataScanner } from "@nestjs/core";
@Module({
    imports: [AuthModule, MessagesModule],
    controllers: [],
    providers: [WebSocketPool, WebSocketAuth, MessagesListener],
})
export class WebSocketModule {}