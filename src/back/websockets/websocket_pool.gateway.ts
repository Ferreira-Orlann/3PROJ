import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
} from "@nestjs/websockets";
import { UUID } from "crypto";
import { Socket } from "socket.io";
import { User } from "../users/users.entity";
import { AuthService } from "../authentication/authentication.service";
import { Session } from "../authentication/session.entity";
import { WebSocketAuthGuard } from "../authentication/ws.authentication.guard";
import { Events } from "../events.enum";

type UserPoolRecord = {
    socket: Socket;
    workspace: UUID[];
};

type AuthenticatedClient = Socket & {
    user: User;
};

@WebSocketGateway()
export class WebSocketPool implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly workspacesPool: Map<UUID, Socket[]> = new Map();
    private readonly usersPool: Map<UUID, UserPoolRecord> = new Map();

    constructor(private readonly authService: AuthService) {}

    handleConnection(client: Socket, ...args: any[]) {
        this.isClientAuthenticated(client).then(async ([isValid, session]) => {
            console.log("Is Valid", isValid);
            if (!isValid) {
                client.disconnect(true);
            }
            const user = await session.owner;
            const record = {
                socket: client,
                workspace: [],
            } as UserPoolRecord;
            console.log("sessions", session, user);
            const workspace_members = await user.workspace_members;
            console.log("workspace_members", workspace_members);
            workspace_members.forEach(async (workspace_member) => {
                const workspace = await workspace_member.workspace;
                console.log("workspace", workspace);
                const workspaceUuid = workspace.uuid;
                let pool = this.workspacesPool.get(workspaceUuid);
                if (pool == undefined) {
                    pool = [client];
                    this.workspacesPool.set(workspaceUuid, pool);
                }
                record.workspace.push(workspaceUuid);
            });
            this.usersPool.set(user.uuid, record);
            client["user"] = user;
            console.log(this.workspacesPool);
            console.log(this.usersPool);
        }).catch((reason) => {
            client.disconnect(true)
        });
    }

    handleDisconnect(client: Socket) {
        this.isClientAuthenticated(client).then(async ([isValid, session]) => {
            if (isValid) {
                const authClient: AuthenticatedClient =
                    client as AuthenticatedClient;
                this.usersPool.delete(authClient.user.uuid);
                const workspace_members =
                    await authClient.user.workspace_members;
                workspace_members.forEach((workspace_member) => {
                    this.workspacesPool.delete(workspace_member.workspace.uuid);
                });
            }
            console.log(this.workspacesPool);
            console.log(this.usersPool);
        });
    }

    private async isClientAuthenticated(
        client,
    ): Promise<[boolean, Session | null]> {
        const token = WebSocketAuthGuard.extractTokenFromHeader(client);
        if (token == undefined) {
            return [false, null];
        }
        const session = await this.authService.getSessionByToken(token);
        if (session == null) {
            return [false, null];
        }
        const isValid = this.authService.isSessionValid(session);
        return [isValid, session];
    }

    getWorkspaceWebsockets(uuid: UUID): Socket[] | undefined {
        return this.workspacesPool.get(uuid);
    }

    getUserPoolRecord(uuid: UUID): UserPoolRecord | undefined {
        return this.usersPool.get(uuid);
    }

    sendEvent(socket: Socket, event: Events, payload: any) {
        socket.emit("message_sent", {
            "timestamp": Math.floor(Date.now() / 1000),
            "event": event,
            "payload":  payload
        });
    }
}
