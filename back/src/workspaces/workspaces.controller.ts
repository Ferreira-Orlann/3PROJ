import { Body, Controller, Get, Post } from "@nestjs/common";
import { WorkspaceService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./workspaces.dto";

@Controller("workspaces")
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Get()
    get() {
        return this.workspaceService.findAll();
    }

    @Post()
    async createWorkspace(@Body() dto: CreateWorkspaceDto) {
        let entity = await this.workspaceService.add(dto)
        return entity
    }
}
