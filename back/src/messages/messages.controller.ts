import { Body, Controller, Get, Post } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./messages.dto";

@Controller("messages")
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    getHello() {
        return this.messagesService.findAll();
    }

    @Post()
    async createChannel(@Body() dto: CreateMessageDto) {
        const entity = await this.messagesService.add(dto);
        return entity;
    }
}
