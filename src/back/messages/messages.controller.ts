import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./messages.dto";
import { UUID } from "crypto";
import { AuthorizationGuard } from "../authorization/authorization.guard";
import { HttpAuthGuard } from "../authentication/http.authentication.guard";
import { Authorize } from "../authorization/authorization.decorator";

@Controller()
@UseGuards(HttpAuthGuard, AuthorizationGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    async getMessage() {
        console.log("data");
        const messages = await this.messagesService.findAll();
        console.log("Messages chargés:", messages);
        return messages;
    }

    @Get("workspaces/:workspaceUuid/channels/:channelUuid/messages")
    async getWorkspaceMessages(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
    ) {
        return await this.messagesService.findMessagesByChannel(channelUuid);
    }

    @Get("users/:userUuid/messages")
    async getPrivateMessages(@Param("userUuid") userUuid: UUID) {
        return await this.messagesService.findMessagesByUser(userUuid);
    }

    @Get(
        "workspaces/:workspaceUuid/channels/:channelUuid/messages/:messageUuid",
    )
    getMessageBy(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Param("messageUuid") messageUuid: UUID,
    ) {
        return this.messagesService.findOneBy(messageUuid);
    }

    @Get("users/:userUuid/messages/:messageUuid")
    getMessageByPrivate(
        @Param("userUuid") userUuid: UUID,
        @Param("messageUuid") messageUuid: UUID,
    ) {
        return this.messagesService.findOneBy(messageUuid);
    }

    @Put(
        "workspaces/:workspaceUuid/channels/:channelUuid/messages/:messageUuid",
    )
    async updateMessage(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Param("messageUuid") messageUuid: UUID,
        @Body() dto: CreateMessageDto,
    ) {
        return this.messagesService.update(messageUuid, dto);
    }

    @Put("users/:userUuid/messages/:messageUuid")
    async updatePrivateMessage(
        @Param("userUuid") userUuid: UUID,
        @Param("messageUuid") messageUuid: UUID,
        @Body() dto: CreateMessageDto,
    ) {
        return this.messagesService.update(messageUuid, dto);
    }

    @Delete(
        "workspaces/:workspaceUuid/channels/:channelUuid/messages/:messageUuid",
    )
    async removeWorkspaceMessage(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Param("messageUuid") messageUuid: UUID,
    ) {
        await this.messagesService.remove(messageUuid);
    }

    @Delete("users/:userUuid/messages/:messageUuid")
    async removePrivateMessage(
        @Param("userUuid") userUuid: UUID,
        @Param("messageUuid") messageUuid: UUID,
    ) {
        await this.messagesService.remove(messageUuid);
    }

    // Route pour les messages de workspace
    @Post("workspaces/:workspaceUuid/channels/:channelUuid/messages")
    async createWorkspaceMessage(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
        @Body() dto: CreateMessageDto,
    ) {
        console.log("Route params (workspace):", {
            workspaceUuid,
            channelUuid,
        });

        // Message de canal de workspace
        dto.destination_uuid = channelUuid;
        dto.is_public = true;

        console.log("DTO après traitement (workspace):", dto);

        const entity = await this.messagesService.add(dto);
        return entity;
    }

    // Route pour les messages privés
    @Post("users/:userUuid/messages")
    async createPrivateMessage(
        @Param("userUuid") userUuid: UUID,
        @Body() dto: CreateMessageDto,
    ) {
        console.log("Route params (privé):", { userUuid });

        // Message privé
        dto.destination_uuid = userUuid;
        dto.is_public = false;

        console.log("DTO après traitement (privé):", dto);

        const entity = await this.messagesService.add(dto);
        return entity;
    }
}
