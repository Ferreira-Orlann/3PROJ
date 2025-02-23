import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./messages.entity";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";
import { Channel } from "../channels/channels.entity";
import { User } from "../users/users.entity";
import { UsersModule } from "../users/users.module";
import { ChannelsModule } from "../channels/channels.module";
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
    exports: [MessagesService]
})
export class MessagesModule {}
