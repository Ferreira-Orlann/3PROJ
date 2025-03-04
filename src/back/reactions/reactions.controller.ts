import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ReactionsService } from "./reactions.service";
import { CreateReactionDto } from "./reactions.dto";
import { UUID } from "crypto";
import { CreateMessageDto } from "../messages/messages.dto";

@Controller([
    "workspaces/:workspaceUuid/channels/:channelUuid/messages/:messageUuid/reactions",
    "users/:userUuid/channels/:channelUuid/messages/:messageUuid/reactions"
])
export class ReactionsController {
    constructor(private readonly reactionsService: ReactionsService) {}

    @Get()
    getReactions() {
        return this.reactionsService.findAll();
    }

    @Get(":reactionUuid")
    getReactionBy(@Param("reactionUuid") reactionUuid: UUID) {
        return this.reactionsService.findOneBy(reactionUuid);
    }

    @Put(":reactionUuid")
    async updateMessage(
        @Param("reactionUuid") reactionsService: UUID,
        @Body() dto: CreateReactionDto,
    ){
        return this.reactionsService.update(reactionsService, dto);
    }

    @Delete(":reactionUuid")
    async deleteMessage(@Param("reactionUuid") reactionUuid: UUID) {
        await this.reactionsService.remove(reactionUuid);
    }

    @Post()
    async createReaction(@Body() dto: CreateReactionDto) {
        const entity = await this.reactionsService.add(dto);
        return entity;
    }
}
