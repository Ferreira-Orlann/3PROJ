import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Messaging } from "./messagings.entity";
import { Repository } from "typeorm";
import { CreateMessagingDto } from "./messagings.dto";
import { WorkspaceMember } from "../workspaces/members/workspace_members.entity";

@Injectable()
export class MessagingsService {
    constructor(
        @InjectRepository(Messaging)
        private readonly messagingsRepo: Repository<Messaging>,
    ) {}
    findAll(): Promise<Messaging[]> {
        return this.messagingsRepo.find();
    }

    findOne(id: number): Promise<Messaging | null> {
        return this.messagingsRepo.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        this.messagingsRepo.delete(id);
    }

    async add(dto: CreateMessagingDto): Promise<Messaging> {
        return this.messagingsRepo.save({
           message: dto.message,
            isPublic: dto.isPublic ?? false,
            userUuid: { uuid: dto.userUuid }
        });
    }


}
