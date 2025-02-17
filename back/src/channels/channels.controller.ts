import { Body, Controller, Get, Param, Post, Delete } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto } from "./channels.dto";

@Controller("channels")
export class ChannelsController {
    constructor(private readonly channelService: ChannelsService) {}

    @Get()
    getAllChannels() {
        return this.channelService.findAll();
    }

    @Post()
    async createChannel(@Body() dto: CreateChannelDto) {
        const entity = await this.channelService.add(dto);
        return entity;
    }

    @Delete(":id")
    async deleteChannel(@Param("id") id: number) {
        await this.channelService.remove(id);
        return { message: `Channel with ID ${id} has been deleted` };
    }
}
