import { Module } from "@nestjs/common";
import { WorkspaceController } from "./workspaces.controller";
import { WorkspaceService } from "./workspaces.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Workspace } from "./workspaces.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Workspace])],
    controllers: [WorkspaceController],
    providers: [WorkspaceService],
})
export class WorkspaceModule {}
