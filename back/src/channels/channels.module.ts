import { Module } from "@nestjs/common";
import { ChannelsController } from "./channels.controller";
import { ChannelsService } from "./channels.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel } from "./channels.entity";
import { Workspace } from "../workspaces/workspaces.entity";
import { User } from "../users/users.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Channel, Workspace, User])],
    controllers: [ChannelsController],
    providers: [ChannelsService],
})
export class ChannelsModule {}
