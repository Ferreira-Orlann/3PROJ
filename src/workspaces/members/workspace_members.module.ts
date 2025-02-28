import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/authentication/authentication.module";
import { WorkspaceMember } from "./workspace_members.entity";
import { Workspace } from "../workspaces.entity";
import { User } from "../../users";
import { WorkspacesMembersService } from "./workspace_members.service";
import { WorkspacesMembersController } from "./workspace_members.controller";

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([WorkspaceMember, User, Workspace]),
    ],
    controllers: [WorkspacesMembersController],
    providers: [WorkspacesMembersService],
    exports: [WorkspacesMembersService],
})
export class WorkspaceMembersModule {}
