import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Workspace } from "./workspaces.entity";
import { Repository } from "typeorm";
import { WorkspacesMembersService } from "./members/workspace_members.service";
import { UUID } from "crypto";
import { CreateWorkspaceDto } from "./workspaces.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Events } from "../events.enum";

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,
        private readonly workspaceMembersService: WorkspacesMembersService,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    async findAll(): Promise<Workspace[]> {
        try {
            const workspaces = await this.workspacesRepo.find({
                relations: ["owner"],
            });

            return workspaces;
        } catch (error) {
            console.error("Error finding workspaces:", error);
            return [];
        }
    }

    async findOne(uuid: UUID): Promise<Workspace | null> {
        try {
            return await this.workspacesRepo.findOne({
                where: { uuid },
                relations: ["owner"],
            });
        } catch (error) {
            console.error(`Error finding workspace with UUID ${uuid}:`, error);
            return null;
        }
    }

    async remove(uuid: UUID): Promise<void> {
        // Récupérer le workspace avant de le supprimer pour pouvoir émettre l'événement
        const workspace = await this.findOne(uuid);
        if (!workspace) {
            throw new NotFoundException(
                `Le workspace avec l'UUID ${uuid} n'existe pas`,
            );
        }
        
        const result = await this.workspacesRepo.delete(uuid);
        if (result.affected === 0) {
            throw new NotFoundException(
                `Le workspace avec l'UUID ${uuid} n'existe pas`,
            );
        }
        
        // Émettre l'événement de suppression
        this.eventEmitter.emit(Events.WORKSPACE_REMOVED, workspace);
    }

    async add(dto: CreateWorkspaceDto): Promise<Workspace> {
        const workspace = await this.workspacesRepo.save({
            name: dto.name,
            description: dto.description,
            owner_uuid: dto.owner_uuid,
            createdAt: dto.createdAt,
            is_public: dto.is_public,
        });
        await this.workspaceMembersService.add(dto.owner_uuid, workspace.uuid, dto.owner_uuid);
        
        // Émettre l'événement de création
        this.eventEmitter.emit(Events.WORKSPACE_CREATED, workspace);

        return workspace;
    }

    async update(
        uuid: UUID,
        name?: string,
        is_public?: boolean,
    ): Promise<Workspace | null> {
        console.log("Workspace to update:", uuid);
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
        
        const updatedWorkspace = await this.workspacesRepo.save(workspace);
        
        // Émettre l'événement de mise à jour
        this.eventEmitter.emit(Events.WORKSPACE_UPDATED, updatedWorkspace);
        
        return updatedWorkspace;
    }
}
