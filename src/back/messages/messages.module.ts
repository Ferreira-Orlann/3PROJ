import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./messages.entity";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { Channel, ChannelsModule } from "../channels";
import { User, UsersModule } from "../users";
import { AuthZModule } from "nest-authz";
@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Channel, User]),
        AuthZModule,
        UsersModule,
        ChannelsModule,
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
    exports: [MessagesService, TypeOrmModule],
})
export class MessagesModule {}
