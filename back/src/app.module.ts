import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces/workspaces.entity";
import { UsersModule } from "./users/users.module";
import { User } from "./users/users.entity";
import { AuthModule } from "./authentication/auth.module";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "127.0.0.1",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "postgres",
            entities: [Workspace, User],
            // synchronize: configService.get<string>("ENV") == EnvType.DEV,
            synchronize: true,
        }),
        WorkspacesModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
