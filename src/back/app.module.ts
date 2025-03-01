import {
    ConsoleLoggerInjector,
    ControllerInjector,
    OpenTelemetryModule,
} from "@amplication/opentelemetry-nestjs";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Workspace, WorkspacesModule } from "./workspaces";
import { User, UsersModule } from "./users";
import { Message, MessagesModule } from "./messages";
import { WorkspaceMember, WorkspaceMembersModule } from "./workspaces/members";
import { Reaction, ReactionsModule } from "./reactions";
import { AuthModule, Session } from "./authentication";
import { Channel, ChannelsModule } from "./channels";
import { WebSocketModule } from "./websockets";
import { FilesModule } from "./files";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
    imports: [
        OpenTelemetryModule.forRoot([
            ControllerInjector,
            ConsoleLoggerInjector,
        ]),
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
                    synchronize: config.get<boolean>("DATABASE_TYPEORM_SYNCHRONISE"),
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
