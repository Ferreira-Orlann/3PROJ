import { Body, Controller, Get, Post } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./workspaces.dto";

@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Get()
    get() {
        return this.workspacesService.findAll();
    }

    @Post()
    async create(@Body() dto: CreateWorkspaceDto) {
        const entity = await this.workspacesService.add(dto);
        return entity;
    }
}
