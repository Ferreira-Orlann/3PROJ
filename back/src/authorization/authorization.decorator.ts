import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { UUID } from "crypto";
import { Request } from "express";

export const PERMISSIONS_METADATA = "__SUP_PHONE_PERMISSIONS_METADATA"

export type Permission = {
    domain: UUID
    resource: UUID
    action: string
}

export type UsePermission = (context: ExecutionContext) => Permission

export const Authorize = (use: UsePermission) => {
    return SetMetadata(PERMISSIONS_METADATA, use);
};

export function HttpWorkspaceResource(action: string, resourceParam: string = "", workspaceParam: string = ""): UsePermission {
    return (context: ExecutionContext) => {
        const request: Request = context.switchToHttp().getRequest() as Request
        return {
            domain: request.params[workspaceParam],
            resource: request.params[resourceParam],
            action: action
        } as Permission
    }
}