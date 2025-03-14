import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./messages.entity";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { ChannelsModule } from "../channels/channels.module";
import { UsersModule } from "../users/users.module";
import { AuthZModule } from "nest-authz";
import { AuthModule } from "../authentication/authentication.module";

import { Channel } from "../channels/channels.entity";
import { User } from "../users/users.entity";
@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Channel, User]),
        AuthZModule,
        UsersModule,
        ChannelsModule,
        AuthModule,
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
    exports: [MessagesService, TypeOrmModule],
})
export class MessagesModule {}
