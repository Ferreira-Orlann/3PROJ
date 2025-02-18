import { OnEvent } from "@nestjs/event-emitter";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
} from "@nestjs/websockets";
import { UUID } from "crypto";
import { Socket } from "socket.io";
import { User } from "src/users/users.entity";

type UserPoolRecord = {
    socket: Socket;
    workspace: UUID[];
};

type AuthenticatedClient = Socket & {
    user: User;
};

@WebSocketGateway()
export class WebSocketPool implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly workspacesPool: Map<UUID, Socket[]>;
    private readonly usersPool: Map<UUID, UserPoolRecord>;

    constructor() {
        this.workspacesPool = new Map<UUID, Socket[]>();
    }

    handleConnection(client: Socket, ...args: any[]) {}

    handleDisconnect(client: Socket) {
        if (this.isClientAuthenticated(client)) {
            const authClient: AuthenticatedClient =
                client as AuthenticatedClient;
            this.usersPool.delete(authClient.user.uuid);
            authClient.user.workspace_members.forEach((workspace_member) => {
                this.workspacesPool.delete(workspace_member.workspace.uuid);
            });
        }
    }

    @OnEvent("websocket.auth.validated")
    auth(client: Socket, user: User) {
        const record = {
            socket: client,
            workspace: [],
        } as UserPoolRecord;
        user.workspace_members.forEach((workspace_member) => {
            const workspaceUuid = workspace_member.workspace.uuid;
            let pool = this.workspacesPool.get(workspaceUuid);
            if (pool == undefined) {
                pool = [client];
                this.workspacesPool.set(workspaceUuid, pool);
            }
            record.workspace.push(workspaceUuid);
        });
        this.usersPool.set(user.uuid, record);
        client["user"] = user;
    }

    isClientAuthenticated(client) {
        return client["user"] != undefined && client["user"] != null;
    }
}
