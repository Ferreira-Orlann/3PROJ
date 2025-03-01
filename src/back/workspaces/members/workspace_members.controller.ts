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
    getAll() {
        return this.workspacesMembersService.findAll();
    }

    @Get(":memberId")
    getOne(@Param("memberId") memberId: UUID) {
        return this.workspacesMembersService.findOne(memberId);
    }
    @Post()
    async create(
        @Param("workspaceId") workspaceId: UUID,
        @Body() dto: { user_uuid: UUID },
    ) {
        if (!dto.user_uuid) {
            throw new BadRequestException("User UUID is required");
        }

        const entity = await this.workspacesMembersService.add(
            dto.user_uuid,
            workspaceId,
        );
        return entity;
    }

    @Delete(":memberId")
    async remove(@Param("memberId") memberId: UUID) {
        await this.workspacesMembersService.remove(memberId);
        return { message: "Workspace member removed successfully" };
    }
}
