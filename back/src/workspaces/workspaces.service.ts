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
        private readonly workspaceMembersService: WorkspacesMembersService
    ) {}

    findAll(): Promise<Workspace[]> {
        return this.workspacesRepo.find();
    }

    findOne(id: number): Promise<Workspace | null> {
        return this.workspacesRepo.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        this.workspacesRepo.delete(id);
    }

    async add(name: string, owner_uuid: UUID): Promise<Workspace> {
        const workspace = await this.workspacesRepo.save({
            name: name,
            owner_uuid: owner_uuid,
        });
        await this.workspaceMembersService.add(owner_uuid, workspace.uuid);

        return workspace;

    }

    async update(id: number, name?: string, is_public?: boolean): Promise<Workspace | null> {
        const workspace = await this.workspacesRepo.findOneBy({ id });
        if (!workspace) {
           throw new NotFoundException(`Workspace with ID ${id} not found`);
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
