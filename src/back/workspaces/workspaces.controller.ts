import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto } from "./workspaces.dto";
import { Workspace } from "./workspaces.entity";
import { randomUUID, UUID } from "crypto";
import { HttpAuthGuard } from "../authentication/http.authentication.guard";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { Authorize } from "../authorization/authorization.decorator";

@UseGuards(HttpAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @UseGuards(HttpAuthGuard, AuthorizationGuard)
    @Authorize((ctx) => {
        return {
            resource: randomUUID(),
            // resource: "8b80c760-4d83-4ed1-9dd0-14969995a1a7",
            domain: "0",
            permission: "READ",
        };
    })
    @Get()
    async findAll() {
        const result = await this.workspacesService.findAll();
        console.log("apiWorkspaces", result);
        return result;
    }

    @Get(":id")
    async findOne(@Param("id") id: UUID): Promise<Workspace> {
        const workspace = await this.workspacesService.findOne(id);
        if (!workspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }
        return workspace;
    }

    @Post()
    async create(@Req() request: any, @Body() dto: CreateWorkspaceDto) {
        const user = request.user;

        if (!user || !user.uuid) {
            throw new Error("User not authenticated or missing UUID");
        }

        const entity = await this.workspacesService.add({
            name: dto.name,
            description: dto.description,
            owner_uuid: user.uuid,
            createdAt: dto.createdAt ?? new Date(),
        });

        return entity;
    }

    @Put(":id")
    async update(
        @Param("id") id: UUID,
        @Body("name") name?: string,
        @Body("is_public") is_public?: boolean,
    ): Promise<Workspace> {
        const updatedWorkspace = await this.workspacesService.update(
            id,
            name,
            is_public,
        );
        if (!updatedWorkspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }
        return updatedWorkspace;
    }

    @Delete(":id")
    async remove(@Param("id") id: UUID): Promise<void> {
        const workspace = await this.workspacesService.findOne(id);
        if (!workspace) {
            throw new NotFoundException(`Workspace with ID ${id} not found`);
        }
        return this.workspacesService.remove(id);
    }
}
