import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Workspace } from "./workspaces.entity";
import { Repository } from "typeorm";
import { CreateWorkspaceDto } from "./workspaces.dto";

@Injectable()
export class WorkspaceService {
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

    async add(dto: CreateWorkspaceDto): Promise<Workspace> {
        return this.workspacesRepo.save(dto)
    }
}
