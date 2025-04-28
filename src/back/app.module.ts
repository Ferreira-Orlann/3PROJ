import { ClassSerializerInterceptor, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";

import { WebSocketModule } from "./websockets/websocket.module";
import { FilesModule } from "./files/files.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { WorkspaceMembersModule } from "./workspaces/members/workspace_members.module";
import { UsersModule } from "./users/users.module";
import { MessagesModule } from "./messages/messages.module";
import { ChannelsModule } from "./channels/channels.module";
import { ReactionsModule } from "./reactions/reactions.module";
import { AuthModule } from "./authentication/authentication.module";
import { User } from "./users/users.entity";
import { Workspace } from "./workspaces/workspaces.entity";
import { Channel } from "./channels/channels.entity";
import { Message } from "./messages/messages.entity";
import { Session } from "./authentication/session.entity";
import { Reaction } from "./reactions/reactions.entity";
import { WorkspaceMember } from "./workspaces/members/workspace_members.entity";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        EventEmitterModule.forRoot({
            wildcard: false,
            delimiter: ".",
            newListener: false,
            removeListener: false,
            maxListeners: 0,
            verboseMemoryLeak: false,
            ignoreErrors: false,
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    type: config.get<string>("DATABASE_TYPEORM_DRIVER"),
                    host: config.get<string>("DATABASE_HOST"),
                    port: config.get<number>("DATABASE_PORT"),
                    username: config.get<string>("DATABSE_USER"),
                    password: config.get<string>("DATABASE_PASSWORD"),
                    database: config.get<string>("DATABSE_DB"),
                    entities: [
                        Workspace,
                        User,
                        Channel,
                        Message,
                        WorkspaceMember,
                        Session,
                        Reaction,
                    ],
                    synchronize: config.get<boolean>(
                        "DATABASE_TYPEORM_SYNCHRONISE",
                    ),
                    logging: true,
                } as TypeOrmModuleOptions;
            },
        }),
        AuthModule,
        WorkspacesModule,
        WorkspaceMembersModule,
        UsersModule,
        ChannelsModule,
        MessagesModule,
        WebSocketModule,
        ReactionsModule,
        FilesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
