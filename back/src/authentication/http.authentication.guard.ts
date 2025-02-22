import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./authentication.service";
import { User } from "src/users/users.entity";

export type IAuthRequest = Request & {
    headers: { authorization: string };
    user: User|undefined
};

@Injectable()
export class HttpAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = HttpAuthGuard.extractTokenFromHeader(request);
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
        request["user"] = session.owner
        return can
    }

    static extractTokenFromHeader(request: IAuthRequest): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
