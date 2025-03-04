import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reaction } from "./reactions.entity";
import { CreateReactionDto } from "./reactions.dto";
import { UsersService } from "../users/users.service";
import { MessagesService } from "../messages/messages.service";
import { UUID } from "crypto";
import { Events } from "../events.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CreateMessageDto } from "../messages/messages.dto";
import { Message } from "../messages/messages.entity";

@Injectable()
export class ReactionsService {
    constructor(
        @InjectRepository(Reaction)
        private readonly reactionRepo: Repository<Reaction>,

        private readonly usersService: UsersService,
        private readonly messagesService: MessagesService,

        private readonly eventEmitter: EventEmitter2,
    ) {}

    findAll(): Promise<Reaction[]> {
        return this.reactionRepo.find({
            relations: ["user", "message"],
        });
    }

    findOneBy(uuid: UUID): Promise<Reaction | null> {
        return this.reactionRepo.findOne({
            where: { uuid },
            relations: ["user", "message", "message.source", "message.destination_user", "message.destination_channel"],
        });
    }

    async update(uuid: UUID, dto: Partial<CreateReactionDto>): Promise<Reaction> {
        const reaction = await this.findOneBy(uuid);
        if (!reaction) {
            throw new NotFoundException(`Reaction with UUID ${uuid} not found`);
        }
        Object.assign(reaction, dto);

        const updatedReaction = await this.reactionRepo.save(reaction);
        this.eventEmitter.emit(Events.REACTION_UPDATED, updatedReaction);
        return updatedReaction;
    }

    async remove(uuid: UUID): Promise<void> {
        const reaction = await this.findOneBy(uuid);
        if (!reaction) {
            throw new NotFoundException(`Reaction with UUID ${uuid} not found`);
        }

        await this.reactionRepo.delete(uuid);
        this.eventEmitter.emit(Events.REACTION_REMOVED, reaction);
    }



    async add(dto: CreateReactionDto): Promise<Reaction> {
        const user = await this.usersService.findOneByUuid(dto.user_uuid);
        if (!user) {
            throw new NotFoundException(
                `User with UUID ${dto.user_uuid} not found`,
            );
        }

        const message = await this.messagesService.findOneBy(dto.message_uuid);
        if (!message) {
            throw new NotFoundException(
                `Message with UUID ${dto.message_uuid} not found`,
            );
        }

        const newReaction = this.reactionRepo.create({
            ...dto,
            user,
            message,
        });
        return new Promise(async (resolve, reject) => {
            const savedReact = await this.reactionRepo.save(newReaction);
            this.eventEmitter.emit(Events.REACTION_CREATED, savedReact);
            resolve(savedReact);
        });
    }
}
