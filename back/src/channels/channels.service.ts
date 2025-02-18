import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "./channels.entity";
import { Repository } from "typeorm";
import { CreateChannelDto } from "./channels.dto";
import { Workspace } from "../workspaces/workspaces.entity";
import { User } from "src/users/users.entity";

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(Channel)
        private readonly channelsRepo: Repository<Channel>,

        @InjectRepository(Workspace)
        private readonly workspacesRepo: Repository<Workspace>,

        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
    ) {}

    findAll(): Promise<Channel[]> {
        return this.channelsRepo.find();
    }

    findOne(id: number): Promise<Channel | null> {
        return this.channelsRepo.findOne({
            where: { id },
            relations: ["workspace", "creator"],
        });
    }

    async remove(id: number): Promise<void> {
        this.channelsRepo.delete(id);
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

        const newChannel = this.channelsRepo.create({
            ...dto,
            workspace,
            creator,
        });

        return this.channelsRepo.save(newChannel);
    }
}
