import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { AuthService } from "./authentication.service";
import { User } from "src/users/users.entity";

export type IAuthSocket = Socket & {
    handshake: { 
        headers: {
            authorization: string 
        }
    };
    user: User|undefined
};

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const socket = context.switchToWs().getClient();
        const token = WebSocketAuthGuard.extractTokenFromHeader(socket);
        if (!token) {
            return false;
        }
        const session = await this.authService.getSessionByToken(token);
        if (!session) {
            return false
        }
        const can = this.authService.isSessionValid(session);
        if (!can) {
            return can
        }
        socket["user"] = session.owner
        return can
    }

    static extractTokenFromHeader(socket: IAuthSocket): string | undefined {
        const [type, token] =
            socket.handshake.headers.authorization?.split(" ") ?? [];
        console.log(socket.handshake.headers);
        return type === "Bearer" ? token : undefined;
    }
}
