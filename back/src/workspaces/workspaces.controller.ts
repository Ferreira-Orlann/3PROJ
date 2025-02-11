import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
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
    async create(@Body() dto: CreateWorkspaceDto) {
        const entity = await this.workspacesService.add(dto);
        return entity;
    }
}
