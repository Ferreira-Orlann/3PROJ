import { Module } from "@nestjs/common";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { WorkspaceMembersModule } from "./members";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces.entity";
import { AuthModule } from "../authentication/authentication.module";

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([Workspace]),
        WorkspaceMembersModule,
    ],
    controllers: [WorkspacesController],
    providers: [WorkspacesService],
})
export class WorkspacesModule {}
