import { OnEvent } from "@nestjs/event-emitter";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
} from "@nestjs/websockets";
import { UUID } from "crypto";
import { Socket } from "socket.io";
import { User } from "src/users/users.entity";

@WebSocketGateway()
export class WebSocketPool implements OnGatewayConnection, OnGatewayDisconnect {
    private workspacesPool: Map<UUID, Socket[]>;

    constructor() {
        this.workspacesPool = new Map<UUID, Socket[]>();
    }

    handleConnection(client: Socket, ...args: any[]) {}

    handleDisconnect(client: Socket) {}

    @OnEvent("websocket.auth.validated")
    auth(client: Socket, user: User) {}
}
