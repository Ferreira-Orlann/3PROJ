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

    findAll(): Promise<Workspace[]> {
        return this.workspacesRepo.find();
    }

    findOne(uuid: UUID): Promise<Workspace | null> {
        return this.workspacesRepo.findOneBy({ uuid });
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
