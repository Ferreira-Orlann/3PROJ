import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./channels.entity";
import { Workspace } from "../workspaces/workspaces.entity";
import { User } from "../users/users.entity";
import { WorkspaceMember } from "../workspaces/members/workspace_members.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, Workspace, User, WorkspaceMember]),
    ],
    controllers: [ChannelsController],
    providers: [ChannelsService],
    exports: [ChannelsService],
})
export class ChannelsModule {}
