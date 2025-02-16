import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "./messages.entity";
import { CreateMessageDto } from "./messages.dto";

@Injectable()
export class MessagesService {
    constructor(
        @InjectRepository(Message)
        private readonly messagingsRepo: Repository<Message>,
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
        return this.messagingsRepo.save({
            message: dto.message,
            isPublic: dto.isPublic ?? false,
            userUuid: { uuid: dto.userUuid },
        });
    }
}
