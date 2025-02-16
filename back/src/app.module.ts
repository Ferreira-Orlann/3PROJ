import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces/workspaces.entity";
import { UsersModule } from "./users/users.module";
import { User } from "./users/users.entity";
import { Channel } from "./channels/channels.entity";
import { ChannelsModule } from "./channels/channels.module";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { WorkspaceMember } from "./workspaces/members/workspace_members.entity";
import { Session } from "./authentication/session.entity";
import { WebSocketModule } from "./websocket/websocket.module";
import { AuthModule } from "./authentication/auth.module";
import { MessagesModule } from "./messages/messages.module";
import { Message } from "./messages/messages.entity";

@Module({
    imports: [
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
            host: "127.0.0.1",
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
            ],
            // synchronize: configService.get<string>("ENV") == EnvType.DEV,
            synchronize: true,
        }),
        WorkspacesModule,
        UsersModule,
        ChannelsModule,
        MessagesModule,
        WebSocketModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
