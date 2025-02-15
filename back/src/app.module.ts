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
import { Messaging } from "./messagings/messagings.entity";
import { MessagingsModule } from "./messagings/messagings.module";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "127.0.0.1",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "postgres",
            entities: [Workspace, User, Channel, Messaging],
            // synchronize: configService.get<string>("ENV") == EnvType.DEV,
            synchronize: true,
        }),
        WorkspacesModule,
        UsersModule,
        ChannelsModule,
        MessagingsModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
