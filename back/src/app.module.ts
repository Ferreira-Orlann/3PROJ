import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
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


import { ConsoleLoggerInjector, ControllerInjector, OpenTelemetryModule } from "@amplication/opentelemetry-nestjs";
import { AuthZModule } from "nest-authz";
import TypeORMAdapter from "typeorm-adapter";
import { TypeORMAdapterConfig, TypeORMAdapterOptions } from "typeorm-adapter/lib/adapter";

const typeormConf: TypeOrmModuleOptions = {
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
    ],
    // synchronize: configService.get<string>("ENV") == EnvType.DEV,
    synchronize: true,
    logging: true
}
@Module({
    imports: [
        OpenTelemetryModule.forRoot([ControllerInjector, ConsoleLoggerInjector]),
        AuthZModule.register({
            model: "./config/casbin.model.conf",
            policy: TypeORMAdapter.newAdapter(typeormConf as TypeORMAdapterOptions),
            userFromContext: (ctx) => {
              const request = ctx.switchToHttp().getRequest();
              return request.user && request.user.uuid;
            },
            resourceFromContext: (ctx, perm) => {
              const request = ctx.switchToHttp().getRequest();
              return { type: perm.resource, id: request.id };
            }
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
        TypeOrmModule.forRoot(typeormConf),
        WorkspacesModule,
        WorkspaceMembersModule,
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
