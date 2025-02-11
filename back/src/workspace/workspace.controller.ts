import { Body, Controller, Get, Post } from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import { CreateWorkspaceDto } from "./workspace.dto";

@Controller("workspaces")
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) {}

    @Get()
    getHello() {
        return this.workspaceService.findAll();
    }

    @Post()
    createWorkspace(@Body() dto: CreateWorkspaceDto) {}
}
