import { Body, Controller, Get, Param, Post, Delete, UseGuards } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto } from "./channels.dto";
import { UUID } from "crypto";
import { HttpAuthGuard } from "../authentication/http.authentication.guard";
import { AuthorizationGuard } from "../authorization/authorization.guard";

@Controller()
@UseGuards(HttpAuthGuard, AuthorizationGuard)
export class ChannelsController {
    constructor(private readonly channelService: ChannelsService) {
        console.log("Channels Controller")
    }

    @Get("channels")
    getAllChannels() {
        return this.channelService.findAll();
    }

    @Get("channels/:id")
    getChannelById(@Param("id") id: UUID) {
        return this.channelService.findOneByUuid(id);
    }

    @Post("users/:userUuid/channels")
    async createUserChannel(@Body() dto: CreateChannelDto) {
        const entity = await this.channelService.add(dto);
        return entity;
    }

    @Post("workspaces/:workspaceUuid/channels",)
    async createWorkspaceChannel(@Body() dto: CreateChannelDto) {
        const entity = await this.channelService.add(dto);
        return entity;
    }

    @Delete("channels/:id")
    async deleteChannel(@Param("id") id: UUID) {
        await this.channelService.remove(id);
        return { message: `Channel with ID ${id} has been deleted` };
    }
}
