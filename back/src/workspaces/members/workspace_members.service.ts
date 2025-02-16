import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WorkspaceMember } from "./workspace_members.entity";
import { Repository } from "typeorm";

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

    async add(name: string, owner_uuid: string): Promise<WorkspaceMember> {
        return this.workspacesRepo.save({
            name: name,
            owner_uuid: owner_uuid,
        });
    }
}
