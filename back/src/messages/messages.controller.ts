import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./messages.dto";
import { UUID } from "crypto";

@Controller("messages")
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    getMessage() {
        return this.messagesService.findAll();
    }

    @Get(":id")
    getMessageBy(@Param("id") id: UUID) {
        return this.messagesService.findOneBy(id);
    }

    @Post()
    async createChannel(@Body() dto: CreateMessageDto) {
        const entity = await this.messagesService.add(dto);
        return entity;
    }
}
