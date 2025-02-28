import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./messages.entity";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { Channel } from "../channels";
import { User } from "../users";
import { UsersModule } from "../users";
import { ChannelsModule } from "../channels";
import { AuthModule } from "src/authentication/authentication.module";
@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Channel, User]),
        AuthModule,
        UsersModule,
        ChannelsModule,
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
    exports: [MessagesService, TypeOrmModule]
})
export class MessagesModule {}
