import { CanActivate, ExecutionContext, Injectable, NotAcceptableException } from "@nestjs/common";
import { Observable } from "rxjs";
import { Permission, PERMISSIONS_METADATA, UsePermission } from "./authorization.decorator";
import { Reflector } from "@nestjs/core";
import { AuthZService } from "nest-authz";
import { User } from "src/users/users.entity";

@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector, private readonly authzService: AuthZService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const permission: Permission = this.reflector.get<UsePermission>(
            PERMISSIONS_METADATA,
            context.getHandler()
        )(context);
        let user: User
        switch(context.getType()) {
            case "http":
                user = context.switchToHttp().getRequest().user
                break
            case "ws":
                user = context.switchToWs().getClient().user
            default:
                throw new NotAcceptableException("Can't handle RPC context")
        }
        if (!user) {
            return false
        }
        return this.authzService.enforce(user.uuid, permission.domain, permission.resource, permission.action)
    }
}