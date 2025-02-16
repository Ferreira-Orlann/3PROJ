import { Body, Controller, Get, Post } from "@nestjs/common";
import { MessagingsService } from "./messagings.service";
import { CreateMessagingDto } from "./messagings.dto";

@Controller("messaging")
export class MessagingsController {
    constructor(private readonly MessagingService: MessagingsService) {}

    @Get()
    getHello() {
        return this.MessagingService.findAll();
    }

    @Post()
    async createChannel(@Body() dto: CreateMessagingDto) {
        const entity = await this.MessagingService.add(dto);
        return entity;
    }
}
