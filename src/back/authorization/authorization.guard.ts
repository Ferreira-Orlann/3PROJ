import {
    CanActivate,
    ExecutionContext,
    Injectable,
    NotAcceptableException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import {
    Permission,
    PERMISSIONS_METADATA,
    UsePermission,
} from "./authorization.decorator";
import { Reflector } from "@nestjs/core";
import { AuthZService } from "nest-authz";
import { User } from "../users/users.entity";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly authzService: AuthZService,
    ) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const authorize = this.reflector.get<UsePermission>(
            PERMISSIONS_METADATA,
            context.getHandler(),
        );
        if (!authorize) {
            return true;
        }
        const permission = authorize(context);
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
        return this.authzService.enforce(
            user.uuid,
            permission.domain,
            permission.resource,
            permission.action,
        );
    }
}
