import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { jwtConstants } from "./const";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";
import { AuthService } from "./auth.service";

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService, private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const socket = context.switchToWs().getClient();
        const token = WebSocketAuthGuard.extractTokenFromHeader(socket);
        if (!token) {
            return false
        }
        return this.authService.isJwtTokenValid(token)
    }

    static extractTokenFromHeader(socket: Socket): string | undefined {
        const [type, token] =
            socket.handshake.headers.authorization?.split(" ") ?? [];
        console.log(socket.handshake.headers);
        return type === "Bearer" ? token : undefined;
    }
}
