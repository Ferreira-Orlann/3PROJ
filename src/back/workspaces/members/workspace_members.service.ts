import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WorkspaceMember } from "./workspace_members.entity";
import { Repository } from "typeorm";
import { randomUUID, UUID } from "crypto";
import { Workspace } from "../workspaces.entity";
import { User } from "../../users/users.entity";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Events } from "../../events.enum";

@Injectable()
export class WorkspacesMembersService {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly workspaceMembersRepo: Repository<WorkspaceMember>,
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    findAll(): Promise<WorkspaceMember[]> {
        return this.workspaceMembersRepo.find({
            relations: ["user", "workspace"],
        });
    }

    async findByWorkspaceId(workspaceId: UUID): Promise<WorkspaceMember[]> {
        return this.workspaceMembersRepo.find({
            where: {
                workspace: { uuid: workspaceId },
            },
            relations: ["user", "workspace"],
        });
    }

    async findOne(uuid: UUID): Promise<WorkspaceMember> {
        const member = await this.workspaceMembersRepo.findOne({
            where: { uuid },
            relations: ["user", "workspace"],
        });
        if (!member) {
            throw new NotFoundException(
                `Workspace Member with ID ${uuid} not found`,
            );
        }
        return member;
    }

    async remove(uuid: UUID, removedBy_uuid?: UUID): Promise<void> {
        // Récupérer le membre avant de le supprimer pour pouvoir émettre l'événement
        const member = await this.findOne(uuid);
        
        await this.workspaceMembersRepo.delete(uuid);
        
        // Émettre un événement pour la création de notification
        if (removedBy_uuid && member) {
            const removedBy = await this.usersRepo.findOneBy({
                uuid: removedBy_uuid,
            });
            
            if (removedBy) {
                this.eventEmitter.emit(Events.WORKSPACE_MEMBER_REMOVED, {
                    member: member,
                    removedBy: removedBy
                });
            }
        }
    }

    async add(user_uuid: UUID, workspace_uuid: UUID, addedBy_uuid?: UUID): Promise<WorkspaceMember> {
        const user = await this.usersRepo.findOneBy({
            uuid: user_uuid,
        });
        if (!user) {
            throw new NotFoundException(
                `User with UUID ${user_uuid} not found`,
            );
        }

        const workspace = await this.workspacesRepo.findOneBy({
            uuid: workspace_uuid,
        });
        console.log("Workspace found:", workspace);
        if (!workspace) {
            throw new NotFoundException(
                `Workspace with UUID ${workspace_uuid} not found`,
            );
        }

        const workspaceMember = this.workspaceMembersRepo.create({
            user,
            workspace,
            uuid: randomUUID(),
        });

        const savedMember = await this.workspaceMembersRepo.save(workspaceMember);
        
        // Émettre un événement pour la création de notification
        if (addedBy_uuid) {
            const addedBy = await this.usersRepo.findOneBy({
                uuid: addedBy_uuid,
            });
            
            if (addedBy) {
                this.eventEmitter.emit(Events.WORKSPACE_MEMBER_ADDED, {
                    member: savedMember,
                    addedBy: addedBy
                });
            }
        }
        
        return savedMember;
    }
}
