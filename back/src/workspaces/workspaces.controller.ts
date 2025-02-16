import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./workspaces.dto";
import { HttpAuthGuard } from "src/authentication/http.auth.guard";

@UseGuards(HttpAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Get()
    get() {
        return this.workspacesService.findAll();
    }

    @Post()
    async create(@Req() request: Request, @Body() dto: CreateWorkspaceDto) {
        const entity = await this.workspacesService.add(dto.name, request["user_id"]);
        return entity;
    }
}
