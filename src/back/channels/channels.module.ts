import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./channels.entity";
import { Workspace } from "../workspaces";
import { User } from "../users";
import { WorkspaceMember } from "../workspaces/members";

@Module({
    imports: [
        TypeOrmModule.forFeature([Channel, Workspace, User, WorkspaceMember]),
    ],
    controllers: [ChannelsController],
    providers: [ChannelsService],
    exports: [ChannelsService],
})
export class ChannelsModule {}
