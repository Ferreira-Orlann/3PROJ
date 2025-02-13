import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "./workspace_members.service";
import { CreateWorkspaceDto } from "./workspaces.dto";
import { AuthGuard } from "src/authentication/auth.guard";

@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Get()
    get() {
        return this.workspacesService.findAll();
    }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Req() request: Request, @Body() dto: CreateWorkspaceDto) {
        const entity = await this.workspacesService.add(dto.name, request["user_id"]);
        return entity;
    }
}
