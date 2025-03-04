import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./messages.entity";
import { CreateMessageDto } from "./messages.dto";
import { UUID } from "crypto";
import { ChannelsService } from "../channels/channels.service";
import { UsersService } from "../users/users.service";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Events } from "../events.enum";

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,

        private readonly usersService: UsersService,
        private readonly channelsService: ChannelsService,

        private readonly eventEmitter: EventEmitter2,
    ) {}
    findAll(): Promise<Message[]> {
        return this.messageRepo.find({
            relations: ["source", "destination_user", "destination_channel"],
        });
    }

    findOneBy(uuid: UUID): Promise<Message | null> {
        return this.messageRepo.findOne({
            where: { uuid },
            relations: ["source", "destination_user", "destination_channel"],
        });
    }

    async update(uuid: UUID, dto: Partial<CreateMessageDto>): Promise<Message> {
        const message = await this.findOneBy(uuid);
        if (!message) {
            throw new NotFoundException(`Message with UUID ${uuid} not found`);
        }

        Object.assign(message, dto);

        const updatedMessage = await this.messageRepo.save(message);
        this.eventEmitter.emit(Events.MESSAGE_UPDATED, updatedMessage);

        return updatedMessage;
    }

    async remove(uuid: UUID): Promise<void> {
        const message = await this.findOneBy(uuid);
        if (!message) {
            throw new NotFoundException(`Message with UUID ${uuid} not found`);
        }

        await this.messageRepo.delete(uuid);
        this.eventEmitter.emit(Events.MESSAGE_REMOVED, message);
    }

    async add(dto: CreateMessageDto): Promise<Message> {
        const source = await this.usersService.findOneByUuid(dto.source_uuid);
        if (!source) {
            throw new NotFoundException(
                `User with UUID ${dto.source_uuid} not found`,
            );
        }

        let destination_user = null;
        let destination_channel = null;

        if (dto.is_public) {
            destination_channel = await this.channelsService.findOneByUuid(
                dto.destination_uuid,
            );

            if (!destination_channel) {
                throw new NotFoundException(
                    `Channel with UUID ${dto.destination_uuid} not found`,
                );
            }
        } else {
            destination_user = await this.usersService.findOneByUuid(
                dto.destination_uuid,
            );

            if (!destination_user) {
                throw new NotFoundException(
                    `User with UUID ${dto.destination_uuid} not found`,
                );
            }
        }

        const newMessage = this.messageRepo.create({
            ...dto,
            source,
            destination_channel,
            destination_user,
        });

        return new Promise(async (resolve, reject) => {
            const savedMsg = await this.messageRepo.save(newMessage);
            this.eventEmitter.emit(Events.MESSAGE_CREATED, savedMsg);
            resolve(savedMsg);
        });
    }
}
