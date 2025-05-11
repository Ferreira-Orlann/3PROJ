import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service";
import { UUID } from "crypto";
import { CreateRoleDto } from "./role.entity";

@Controller("authorization")
export class AuthorizationController {
    constructor(private readonly authorizationService: AuthorizationService) {}
    
    @Get("/:workspaceUUID/roles/:uuid")
    public getRoles(@Param("uuid") uuid: UUID, @Param("workspaceUUID") workspaceUUID: UUID) {
        return this.authorizationService.findOneRoleByUuidAndWorkspace(uuid, workspaceUUID)
    }

    @Post("/:workspaceUUID/roles")
    public createRole(@Param("workspaceUUID") workspaceUUID: UUID, @Body() dto: CreateRoleDto) {
        return this.authorizationService.addRole(dto)
    }

    @Get("/:workspaceUUID/roles/:roleUUID/permissions")
    public getPermission(@Param("workspaceUUID") workspaceUUID: UUID, @Param("roleUUID") uuid: UUID) {
        
    }
}