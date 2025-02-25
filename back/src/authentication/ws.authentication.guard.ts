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
            authorization?: string;
            authorize?: string;
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
        const socket = context.switchToWs().getClient<IAuthSocket>();
        const token = WebSocketAuthGuard.extractTokenFromHeader(socket);
        if (!token) {
            console.log("❌ Aucun token trouvé, accès refusé.");
            return false;
        }
        console.log("🔑 Token extrait :", token);
        const session = await this.authService.getSessionByToken(token);
        if (!session) {
            console.log("❌ Session introuvable ou invalide.");
            return false
        }
        const can = this.authService.isSessionValid(session);
        if (!can) {
            console.log("❌ Session expirée ou invalide.");
            return can
        }
        socket["user"] = session.owner
        console.log("✅ Utilisateur authentifié :", session.owner.uuid);
        return can
    }

    static extractTokenFromHeader(socket: IAuthSocket): string | undefined {
        console.log("📡 Headers reçus :", socket.handshake.headers);

        const authHeader = socket.handshake.headers.authorization || socket.handshake.headers.authorize;

        if (!authHeader) {
            console.log("❌ Aucun header d'autorisation trouvé");
            return undefined;
        }

        const [type, token] = authHeader.split(" ");
        return type === "Bearer" ? token : authHeader;
    }
}
