import {
    CanActivate,
    ExecutionContext,
    Injectable,
    NotAcceptableException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import {
    PERMISSIONS_METADATA,
    UsePermission,
} from "./authorization.decorator";
import { Reflector } from "@nestjs/core";
import { User } from "../users/users.entity";
import { ConfigService } from "@nestjs/config";
import { AuthorizationService } from "./authorization.service";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly auth: AuthorizationService,
        private readonly configService: ConfigService,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        if (this.configService.get("AUTHORIZATION_ON") == "false") {
            return true;
        }
        const authorize = this.reflector.get<UsePermission>(
            PERMISSIONS_METADATA,
            context.getHandler(),
        );
        if (!authorize) {
            return true;
        }
        const permission = authorize(context);
        if (typeof permission == "boolean" || permission instanceof Boolean) {
            return (permission as unknown) as boolean
        }
        let user: User;
        switch (context.getType()) {
            case "http":
                user = context.switchToHttp().getRequest().user;
                break;
            case "ws":
                user = context.switchToWs().getClient().user;
                break;
            default:
                throw new NotAcceptableException("Can't handle RPC context");
        }
        if (!user) {
            return false;
        }
        return this.auth.enforce(
            user,
            permission.domain,
            permission.resource,
            permission.permission,
        );
    }
}
