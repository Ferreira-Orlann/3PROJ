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
import { UUID } from "crypto";
import { HttpAuthGuard } from "../authentication/http.authentication.guard";

@UseGuards(HttpAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Get()
    async findAll(@Req() request: any) {
        // Log the authenticated user for debugging
        console.log('Authenticated user:', request.user);
        const result = await this.workspacesService.findAll();
        console.log("result", result)
        
        // Proceed with finding all workspaces
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
        // Access the user object that was set by HttpAuthGuard
        const user = request.user;
        
        if (!user || !user.uuid) {
            throw new Error('User not authenticated or missing UUID');
        }
        
        const entity = await this.workspacesService.add(
            dto.name,
            user.uuid, // Use user.uuid instead of user_id
        );
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
