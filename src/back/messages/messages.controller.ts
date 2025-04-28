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

@Controller([
    "workspaces/:workspaceUuid/channels/:channelUuid/messages",
    "users/:userUuid/channels/:channelUuid/messages",
])
@UseGuards(HttpAuthGuard, AuthorizationGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    // @Authorize(HttpWorkspaceResource("VIEW ALL", "channelUuid"))
    @Authorize((context) => {
        return {
            domain:
                (context.switchToHttp().getRequest().params
                    .workspaceUuid as UUID) ||
                context.switchToHttp().getRequest().params.userUuid,
            resource: context.switchToHttp().getRequest().params
                .channelUuid as UUID,
            action: "VIEW ALL",
        };
    })
    async getMessage(
        @Param("workspaceUuid") workspaceUuid: UUID,
        @Param("userUuid") userUuid: UUID,
        @Param("channelUuid") channelUuid: UUID,
    ) {
        console.log("data");
        const data = await this.messagesService.findAll();
        return data;
    }

    @Get(":messageUuid")
    getMessageBy(@Param("messageUuid") messageUuid: UUID) {
        return this.messagesService.findOneBy(messageUuid);
    }
    @Put(":messageUuid")
    async updateMessage(
        @Param("messageUuid") messageUuid: UUID,
        @Body() dto: CreateMessageDto,
    ) {
        return this.messagesService.update(messageUuid, dto);
    }

    @Delete(":messageUuid")
    async deleteMessage(@Param("messageUuid") messageUuid: UUID) {
        await this.messagesService.remove(messageUuid);
    }

    @Post()
    async createChannel(@Body() dto: CreateMessageDto) {
        const entity = await this.messagesService.add(dto);
        return entity;
    }
}
