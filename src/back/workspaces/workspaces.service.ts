import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Workspace } from "./workspaces.entity";
import { Repository } from "typeorm";
import { WorkspacesMembersService } from "./members/workspace_members.service";
import { UUID } from "crypto";

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,
        private readonly workspaceMembersService: WorkspacesMembersService,
    ) {}

    async findAll(): Promise<Workspace[]> {
        try {
            console.log('Finding all workspaces');
            // Include relations to properly load related entities
            const workspaces = await this.workspacesRepo.find({
                relations: ['owner']
            });
            console.log('Found workspaces:', workspaces);
            return workspaces || [];
        } catch (error) {
            console.error('Error finding workspaces:', error);
            return [];
        }
    }

    async findOne(uuid: UUID): Promise<Workspace | null> {
        try {
            return await this.workspacesRepo.findOne({
                where: { uuid },
                relations: ['owner']
            });
        } catch (error) {
            console.error(`Error finding workspace with UUID ${uuid}:`, error);
            return null;
        }
    }

    async remove(uuid: UUID): Promise<void> {
        this.workspacesRepo.delete(uuid);
    }

    async add(name: string, owner_uuid: UUID): Promise<Workspace> {
        const workspace = await this.workspacesRepo.save({
            name: name,
            owner_uuid: owner_uuid,
        });
        await this.workspaceMembersService.add(owner_uuid, workspace.uuid);

        return workspace;
    }

    async update(
        uuid: UUID,
        name?: string,
        is_public?: boolean,
    ): Promise<Workspace | null> {
        const workspace = await this.workspacesRepo.findOneBy({ uuid });
        if (!workspace) {
            throw new NotFoundException(`Workspace with ID ${uuid} not found`);
        }

        if (name !== undefined) {
            workspace.name = name;
        }

        if (is_public !== undefined) {
            workspace.is_public = is_public;
        }

        return this.workspacesRepo.save(workspace);
    }
}
