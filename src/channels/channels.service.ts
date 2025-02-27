import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "./channels.entity";
import { Repository } from "typeorm";
import { CreateChannelDto } from "./channels.dto";
import { Workspace } from "../workspaces/workspaces.entity";
import { User } from "src/users/users.entity";
import { WorkspaceMember } from "src/workspaces/members/workspace_members.entity";
import { randomUUID, UUID } from "crypto";

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(Channel)
        private readonly channelsRepo: Repository<Channel>,

        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,

        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,

        @InjectRepository(WorkspaceMember)
        private readonly workspaceMembersRepo: Repository<WorkspaceMember>,
    ) {}

    findAll(): Promise<Channel[]> {
        return this.channelsRepo.find({
            relations: ["creator", "workspace"],
        });
    }

    findOneByUuid(uuid: UUID): Promise<Channel | null> {
        return this.channelsRepo.findOne({
            where: { uuid },
            relations: ["creator", "workspace"],
        });
    }

    async remove(uuid: UUID): Promise<void> {
        this.channelsRepo.delete(uuid);
    }

    async add(dto: CreateChannelDto): Promise<Channel> {
        const workspace = await this.workspacesRepo.findOneBy({
            uuid: dto.workspace_uuid,
        });

        if (!workspace) {
            throw new Error("Workspace not found");
        }

        const creator = await this.usersRepo.findOneBy({
            uuid: dto.creator_uuid,
        });

        if (!creator) {
            throw new Error("User (creator) not found");
        }

        const isMember = await this.workspaceMembersRepo.findOne({
            where: {
                user: { uuid: dto.creator_uuid },
                workspace: { uuid: dto.workspace_uuid },
            },
        });

        if (!isMember) {
            throw new ForbiddenException(
                "Only workspace members can create channels",
            );
        }

        const newChannel = this.channelsRepo.create({
            ...dto,
            workspace,
            creator,
        });

        return this.channelsRepo.save(newChannel);
    }
}
