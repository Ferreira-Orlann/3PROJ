import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WorkspaceModule } from "./workspaces/workspace.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces/workspace.entity";

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: "postgres",
            host: "127.0.0.1",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "postgres",
            entities: [Workspace],
            // synchronize: configService.get<string>("ENV") == EnvType.DEV,
            synchronize: true,
        }),
        WorkspaceModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
