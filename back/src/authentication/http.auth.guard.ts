import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";

type IAuthRequest = Request & {
    headers: { authorization: string };
};

@Injectable()
export class HttpAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = HttpAuthGuard.extractTokenFromHeader(request);
        return this.authService.isJwtTokenValid(token)
    }

    static extractTokenFromHeader(request: IAuthRequest): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
