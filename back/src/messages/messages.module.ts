import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./messages.entity";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { Channel } from "../channels/channels.entity";
import { User } from "../users/users.entity";
@Module({
    imports: [TypeOrmModule.forFeature([Message, Channel, User])],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule {}
