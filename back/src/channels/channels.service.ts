import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Channel } from "./channels.entity";
import { Repository } from "typeorm";
import { CreateChannelDto } from "./channels.dto";

@Injectable()
export class ChannelsService {
    constructor(
        @InjectRepository(Channel)
        private readonly channelsRepo: Repository<Channel>,
    ) {}
    
    findAll(): Promise<Channel[]> {
        return this.channelsRepo.find();
    }

    findOne(id: number): Promise<Channel | null> {
        return this.channelsRepo.findOneBy({ id });
    }

    async remove(id: number): Promise<void> {
        this.channelsRepo.delete(id);
    }

    async add(dto: CreateChannelDto): Promise<Channel> {
        return this.channelsRepo.save(dto)
    }
}
