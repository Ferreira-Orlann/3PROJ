import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { UUID } from "crypto";

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