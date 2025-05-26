import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { UsersModule } from "../users/users.module";
import { ChannelsModule } from "../channels/channels.module";
import { WorkspacesModule } from "../workspaces/workspaces.module";
import { MessagesModule } from "../messages/messages.module";
import { ReactionsModule } from "../reactions/reactions.module";
import { AuthZModule } from "nest-authz";
import { AuthModule } from "../authentication/authentication.module";
import { User } from "../users/users.entity";
import { Channel } from "../channels/channels.entity";
import { Message } from "../messages/messages.entity";
import { Workspace } from "../workspaces/workspaces.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification, User, Channel, Message, Workspace]),
        AuthZModule,
        UsersModule,
        ChannelsModule,
        WorkspacesModule,
        MessagesModule,
        ReactionsModule,
        AuthModule,
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService],
    exports: [NotificationsService, TypeOrmModule],
})
export class NotificationsModule {}
