import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WorkspacesModule } from "./workspaces/workspaces.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces/workspaces.entity";

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
        WorkspacesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
