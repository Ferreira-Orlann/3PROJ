import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./authentication.service";
import { User } from "../users/users.entity";

export type IAuthRequest = Request & {
    headers: { authorization: string };
    user: User | undefined;
};

@Injectable()
export class HttpAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = HttpAuthGuard.extractTokenFromHeader(request);
        console.log("Token:", token);
        if (!token) {
            return false;
        }
        console.log("1");
        const session = await this.authService.getSessionByToken(token);
        console.log("Session:", session);
        if (!session) {
            return false;
        }
        console.log("2");
        const can = this.authService.isSessionValid(session);
        if (!can) {
            return can;
        }
        console.log("3");
        request["user"] = session.owner;
        return can;
    }

    static extractTokenFromHeader(request: IAuthRequest): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
