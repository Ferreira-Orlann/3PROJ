import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./workspaces.dto";
import { HttpAuthGuard } from "src/authentication/http.auth.guard";
import { Workspace } from "./workspaces.entity";

@UseGuards(HttpAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Get()
    get() {
        return this.workspacesService.findAll();
    }

    @Get(":id")
    async findOne(@Param("id") id: number): Promise<Workspace> {
        const workspace = await this.workspacesService.findOne(id);
        if (!workspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }
        return workspace;
    }

    @Post()
    async create(@Req() request: Request, @Body() dto: CreateWorkspaceDto) {
        const entity = await this.workspacesService.add(
            dto.name,
            request["user_id"],
        );
        return entity;
    }

    @Put(":id")
    async update(
        @Param("id") id: number,
        @Body("name") name?: string,
        @Body("is_public") is_public?: boolean
    ): Promise<Workspace> {
        const updatedWorkspace = await this.workspacesService.update(id, name, is_public);
        if (!updatedWorkspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }
        return updatedWorkspace;
    }

    @Delete(":id")
    async remove(@Param("id") id: number): Promise<void> {
        const workspace = await this.workspacesService.findOne(id);
        if (!workspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }
        return this.workspacesService.remove(id);
    }



}
