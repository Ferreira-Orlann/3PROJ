import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { Workspace } from "./workspaces/workspaces.entity";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { UsersModule } from "./users/users.module";
import { User } from "./users/users.entity";
import { Channel } from "./channels/channels.entity";
import { ChannelsModule } from "./channels/channels.module";
import { WorkspaceMember } from "./workspaces/members/workspace_members.entity";
import { WorkspaceMembersModule } from "./workspaces/members/workspace_members.module";
import { MessagesModule } from "./messages/messages.module";
import { Message } from "./messages/messages.entity";
import { Session } from "./authentication/session.entity";
import { WebSocketModule } from "./websocket/websocket.module";
import { AuthModule } from "./authentication/auth.module";
import { Reaction } from './reactions/reaction.entity';


import { ConsoleLoggerInjector, ControllerInjector, OpenTelemetryModule } from "@amplication/opentelemetry-nestjs";
import { ReactionsModule } from "./reactions/reactions.module";

@Module({
    imports: [
        OpenTelemetryModule.forRoot([ControllerInjector, ConsoleLoggerInjector]),
        EventEmitterModule.forRoot({
            wildcard: false,
            delimiter: ".",
            newListener: false,
            removeListener: false,
            maxListeners: 0,
            verboseMemoryLeak: false,
            ignoreErrors: false,
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "localhost",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "postgres",
            entities: [
                Workspace,
                User,
                Channel,
                Message,
                WorkspaceMember,
                Session,
                Reaction,
            ],
            // synchronize: configService.get<string>("ENV") == EnvType.DEV,
            synchronize: true,
        }),
        WorkspacesModule,
        WorkspaceMembersModule,
        UsersModule,
        ChannelsModule,
        MessagesModule,
        WebSocketModule,
        AuthModule,
        ReactionsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
