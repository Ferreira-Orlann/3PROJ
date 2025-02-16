import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { jwtConstants } from "./const";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

@Injectable()
export class WebSocketAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const socket = context.switchToWs().getClient();
        const token = this.extractTokenFromHeader(socket);
        console.log(token);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtConstants.secret,
            });
            socket["user_uuid"] = payload;
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(socket: Socket): string | undefined {
        const [type, token] =
            socket.handshake.headers.authorization?.split(" ") ?? [];
        console.log(socket.handshake.headers);
        return type === "Bearer" ? token : undefined;
    }
}
