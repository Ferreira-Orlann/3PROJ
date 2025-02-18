import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WorkspaceMember } from "./workspace_members.entity";
import { Repository } from "typeorm";
import { User } from "src/users/users.entity";
import { randomUUID } from "crypto";
import { Workspace } from "../workspaces.entity";

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(WorkspaceMember)
        private readonly workspacesRepo: Repository<WorkspaceMember>,
    ) {}

    findAll(): Promise<WorkspaceMember[]> {
        return this.workspacesRepo.find();
    }

    findOne(id: number): Promise<WorkspaceMember | null> {
        return this.workspacesRepo.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        this.workspacesRepo.delete(id);
    }

    async add(workspace: Workspace, user: User): Promise<WorkspaceMember> {
        return this.workspacesRepo.save({
            user: user,
            uuid: randomUUID(),
            workspace: workspace
        });
    }
}
