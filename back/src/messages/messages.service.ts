import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./messages.entity";
import { CreateMessageDto } from "./messages.dto";
import { User } from "../users/users.entity";
import { Channel } from "../channels/channels.entity";

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly messagingsRepo: Repository<Message>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(Channel)
        private readonly channelRepository: Repository<Channel>
    ) {}
    findAll(): Promise<Message[]> {
        return this.messagingsRepo.find();
    }

    findOne(id: number): Promise<Message | null> {
        return this.messagingsRepo.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        this.messagingsRepo.delete(id);
    }

    async add(dto: CreateMessageDto): Promise<Message> {

         const user = await this.userRepository.findOneBy( {
             uuid: dto.user_uuid
         });
        if (!user) throw new Error("User not found");

        const channel = await this.channelRepository.findOneBy({
            uuid: dto.channel_uuid
        });
        if (!channel) throw new Error("Channel not found");

        const newMessage = this.messagingsRepo.create({
            ...dto,
            user,
            channel
        });
        return this.messagingsRepo.save(newMessage);
    }
}
