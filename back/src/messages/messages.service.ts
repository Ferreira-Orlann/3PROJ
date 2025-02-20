import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./messages.entity";
import { CreateMessageDto } from "./messages.dto";
import { User } from "../users/users.entity";
import { Channel } from "../channels/channels.entity";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { WebSocketPool } from "src/websocket/websocket_pool.gateway";

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,

        @InjectRepository(User)
        private readonly userRepo: Repository<User>,

        @InjectRepository(Channel)
        private readonly channelRepo: Repository<Channel>,

        private readonly eventEmitter: EventEmitter2,

        private readonly websocketPool: WebSocketPool
    ) {}
    findAll(): Promise<Message[]> {
        return this.messageRepo.find({
            relations: ["source", "destinationUser", "destinationChannel"]
        });
    }

    findOne(id: number): Promise<Message | null> {
        return this.messageRepo.findOne({
            where: { id },
            relations: ["source", "destinationUser", "destinationChannel"]
        });
    }

    async remove(id: number): Promise<void> {
        this.messageRepo.delete(id);
    }

    async add(dto: CreateMessageDto): Promise<Message> {

         const source  = await this.userRepo.findOneBy( {
             uuid: dto.source_uuid
         });
        if (!source) {
            throw new NotFoundException(`User with UUID ${dto.source_uuid} not found`);
        }

        let destination_user = null;
        let destination_channel = null;

        if (dto.is_public) {
            destination_channel = await this.channelRepo.findOneBy({ uuid: dto.destination_uuid });

            if (!destination_channel) {
                throw new NotFoundException(`Channel with UUID ${dto.destination_uuid} not found`);
            }
        } else {
            destination_user = await this.userRepo.findOneBy({ uuid: dto.destination_uuid });

            if (!destination_user) {
                throw new NotFoundException(`User with UUID ${dto.destination_uuid} not found`);
            }
        }

        const newMessage = this.messageRepo.create({
            ...dto,
            source,
            destination_channel,
            destination_user
        });

        this.eventEmitter.emit("message.create", newMessage)
        return this.messageRepo.save(newMessage);
    }

    @OnEvent("message.create")
    messageCreated(message: Message) {
        
    }
}
