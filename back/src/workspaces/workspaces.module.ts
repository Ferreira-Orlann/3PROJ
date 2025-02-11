import { Module } from "@nestjs/common";
import { WorkspacesController } from "./workspaces.controller";
import { WorkspacesService } from "./workspaces.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Workspace])],
    controllers: [WorkspacesController],
    providers: [WorkspacesService],
})
export class WorkspaceModule {}
