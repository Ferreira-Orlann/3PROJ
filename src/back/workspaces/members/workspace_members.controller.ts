import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { WorkspacesMembersService } from "./workspace_members.service";
import { HttpAuthGuard } from "../../authentication/http.authentication.guard";
import { UUID } from "crypto";

@UseGuards(HttpAuthGuard)
@Controller("workspaces/:workspaceId/members/")
export class WorkspacesMembersController {
    constructor(
        private readonly workspacesMembersService: WorkspacesMembersService,
    ) {}

    @Get()
    getAll(@Param("workspaceId") workspaceId: UUID) {
        return this.workspacesMembersService.findByWorkspaceId(workspaceId);
    }

    @Get(":memberId")
    getOne(@Param("memberId") memberId: UUID) {
        return this.workspacesMembersService.findOne(memberId);
    }
    @Post()
    async create(
        @Param("workspaceId") workspaceId: UUID,
        @Body() dto: { user_uuid: UUID },
        @Req() request
    ) {
        if (!dto.user_uuid) {
            throw new BadRequestException("User UUID is required");
        }

        // Récupérer l'utilisateur qui fait la requête (celui qui ajoute le membre)
        const addedBy = request.user;

        const entity = await this.workspacesMembersService.add(
            dto.user_uuid,
            workspaceId,
            addedBy.uuid
        );
        return entity;
    }

    @Delete(":memberId")
    async remove(
        @Param("memberId") memberId: UUID,
        @Req() request
    ) {
        // Récupérer l'utilisateur qui fait la requête (celui qui supprime le membre)
        const removedBy = request.user;
        
        await this.workspacesMembersService.remove(memberId, removedBy.uuid);
        return { message: "Workspace member removed successfully" };
    }
}
