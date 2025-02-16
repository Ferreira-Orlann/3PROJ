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
        const token = this.extractTokenFromHeader(request);
        const pSession = this.authService.getSession(token);
        return new Promise((resolve, _) => {
            pSession
                .then((_) => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }

    private extractTokenFromHeader(request: IAuthRequest): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
