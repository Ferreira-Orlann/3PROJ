import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ReactionsService } from "./reactions.service";
import { CreateReactionDto } from "./reactions.dto";
import { UUID } from "crypto";

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

    @Get(":id")
    getReactionBy(@Param("id") id: UUID){
        return this.reactionsService.findOneBy(id);
    }

    @Post()
    async createReaction(@Body() dto: CreateReactionDto) {
        const entity = await this.reactionsService.add(dto);
        return entity;
    }
}
