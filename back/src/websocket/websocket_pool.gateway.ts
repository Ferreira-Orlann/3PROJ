import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
} from "@nestjs/websockets";
import { UUID } from "crypto";
import { Socket } from "socket.io";
import { AuthService } from "src/authentication/auth.service";
import { Session } from "src/authentication/session.entity";
import { WebSocketAuthGuard } from "src/authentication/ws.auth.guard";
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
    private readonly workspacesPool: Map<UUID, Socket[]> = new Map();
    private readonly usersPool: Map<UUID, UserPoolRecord> = new Map();

    constructor(private readonly authService: AuthService) {}

    handleConnection(client: Socket, ...args: any[]) {
        this.isClientAuthenticated(client).then(([isValid, session]) => {
            if (!isValid) { return }
            const user = session.owner
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
        })
    }

    handleDisconnect(client: Socket) {
        this.isClientAuthenticated(client).then(([isValid, session]) => {
            if (isValid) {
                const authClient: AuthenticatedClient =
                    client as AuthenticatedClient;
                this.usersPool.delete(authClient.user.uuid);
                authClient.user.workspace_members.forEach((workspace_member) => {
                    this.workspacesPool.delete(workspace_member.workspace.uuid);
                });
            }
        })
        
    }

    private async isClientAuthenticated(client): Promise<[boolean, Session|null]> {
        const token = WebSocketAuthGuard.extractTokenFromHeader(client)
        if (token == undefined) { return [false, null] }
        const session = await this.authService.getSessionByToken(token)
        if (session == null) { return [false, null] }
        const isValid = this.authService.isSessionValid(session)
        return [isValid, session]
    }
}
