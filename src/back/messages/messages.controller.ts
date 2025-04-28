import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./messages.dto";
import { UUID } from "crypto";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { HttpAuthGuard } from "../authentication/http.authentication.guard";
import { Authorize } from "../authorization/authorization.decorator";


@Controller([
    "workspaces/:workspaceUuid/channels/:channelUuid/messages",
    "users/:userUuid/channels/:channelUuid/messages",
])
@UseGuards(HttpAuthGuard, AuthorizationGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    async getMessage() {
        console.log("data");
        const messages = await this.messagesService.findAll();
        console.log('Messages chargés:', messages);
        return messages;
    }
    
    @Get(":messageUuid")
    getMessageBy(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("userUuid") userUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Param("messageUuid") messageUuid: UUID
    ) {
        return this.messagesService.findOneBy(messageUuid);
    }
    
    @Put(":messageUuid")
    async updateMessage(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("userUuid") userUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Param("messageUuid") messageUuid: UUID,
        @Body() dto: CreateMessageDto,
    ){
        return this.messagesService.update(messageUuid, dto);
    }

    @Delete(":messageUuid")
    async deleteMessage(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("userUuid") userUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Param("messageUuid") messageUuid: UUID
    ) {
        await this.messagesService.remove(messageUuid);
    }

    @Post()
    async createMessage(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("userUuid") userUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Body() dto: CreateMessageDto
    ) {
        // Ensure the DTO has the correct destination UUID (channelUuid)
        dto.destination_uuid = channelUuid;
        console.log('DTO:', dto);
        console.log('DTO:', dto.destination_uuid);
        
        // Set is_public based on whether this is a workspace channel or direct message
        dto.is_public = !!workspaceUuid;
        
        const entity = await this.messagesService.add(dto);
        return entity;
    }
}
