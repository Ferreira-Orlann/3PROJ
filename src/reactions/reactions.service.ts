import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reaction } from "./reactions.entity";
import { CreateReactionDto } from "./reactions.dto";
import { UsersService } from "../users/users.service";
import { MessagesService } from "../messages/messages.service";
import { UUID } from "crypto";

@Injectable()
export class ReactionsService {
    constructor(
        @InjectRepository(Reaction)
        private readonly reactionRepo: Repository<Reaction>,

        private readonly usersService: UsersService,
        private readonly messagesService: MessagesService,
    ) {}
    
    findAll(): Promise<Reaction[]> {
        return this.reactionRepo.find({
            relations: ["user", "message"],
        });
    }

    findOneBy(uuid: UUID): Promise<Reaction | null> {
        return this.reactionRepo.findOne({
            where: { uuid },
            relations: ["user", "message"],
        });
    }

    async remove(uuid: UUID): Promise<void> {
        this.reactionRepo.delete(uuid);
    }

    async add(dto: CreateReactionDto): Promise<Reaction> {
        const user = await this.usersService.findOneByUuid(dto.user_uuid);
        if (!user) {
            throw new NotFoundException(`User with UUID ${dto.user_uuid} not found`);
        }

        const message = await this.messagesService.findOneBy(dto.message_uuid);
        if (!message) {
            throw new NotFoundException(`Message with UUID ${dto.message_uuid} not found`);
        }

        const newReaction = this.reactionRepo.create({
            ...dto,
            user,
            message,
        });
        return this.reactionRepo.save(newReaction);
    }
}
