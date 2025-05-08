import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { UUID } from "crypto";
import { Request } from "express";
import { Permission } from "./permissions";

export const PERMISSIONS_METADATA = "__SUP_PHONE_PERMISSIONS_METADATA";

export type AuthrorizationDescription = {
    domain: UUID | "0";
    resource: UUID;
    permission: Permission;
};

export type UsePermission = (
    context: ExecutionContext,
) => AuthrorizationDescription | boolean;

export const Authorize = (use: UsePermission) => {
    return SetMetadata(PERMISSIONS_METADATA, use);
};

export function HttpWorkspaceResource(
    action: string,
    resourceParam: string,
    workspaceParam: string = "workspaceUuid",
): UsePermission {
    return (context: ExecutionContext) => {
        const request: Request = context.switchToHttp().getRequest() as Request;
        return {
            domain: request.params[workspaceParam],
            resource: request.params[resourceParam],
            permission: action,
        } as AuthrorizationDescription;
    };
}
