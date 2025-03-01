import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WorkspaceMember } from "./workspace_members.entity";
import { Repository } from "typeorm";
import { randomUUID, UUID } from "crypto";
import { Workspace } from "../workspaces.entity";
import { User } from "../../users";

@Injectable()
export class WorkspacesMembersService {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly workspaceMembersRepo: Repository<WorkspaceMember>,
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,
    ) {}

    findAll(): Promise<WorkspaceMember[]> {
        return this.workspaceMembersRepo.find({
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

    async remove(uuid: UUID): Promise<void> {
        this.workspaceMembersRepo.delete(uuid);
    }

    async add(user_uuid: UUID, workspace_uuid: UUID): Promise<WorkspaceMember> {
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

        return this.workspaceMembersRepo.save(workspaceMember);
    }
}
