import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Workspace } from "./workspace_members.entity";
import { Repository } from "typeorm";

@Injectable()
export class WorkspacesService {
    constructor(
        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,
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

    async add(name: string, owner_uuid: string): Promise<Workspace> {
        return this.workspacesRepo.save({
            name: name,
            owner_uuid: owner_uuid
        });
    }
}
