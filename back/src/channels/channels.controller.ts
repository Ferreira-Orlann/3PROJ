import { Body, Controller, Get, Param, Post, Delete } from "@nestjs/common";
import { ChannelsService } from "./channels.service";
import { CreateChannelDto } from "./channels.dto";

@Controller("channels")
export class ChannelsController {
    constructor(private readonly ChannelService: ChannelsService) {}

    @Get()
    getHello() {
        return this.ChannelService.findAll();
    }

    @Post()
    async createChannel(@Body() dto: CreateChannelDto) {
        let entity = await this.ChannelService.add(dto)
        return entity
    }

    @Delete()
    async deleteChannel(@Param('id') id: number) {
        let entity = await this.ChannelService.remove(id)
        return entity
    }

}
     