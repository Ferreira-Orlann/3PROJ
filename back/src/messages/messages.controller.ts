import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { CreateMessageDto } from "./messages.dto";
import { UUID } from "crypto";
import { HttpAuthGuard } from "src/authentication/http.authentication.guard";
import { AuthorizationGuard } from "src/authorization/authorization.guard";
import { Authorize, HttpWorkspaceResource, Permission, UsePermission } from "src/authorization/authorization.decorator";


@Controller([
    "workspaces/:workspaceUuid/channels/:channelUuid/messages",
    "users/:userUuid/channels/:channelUuid/messages"
])
@UseGuards(HttpAuthGuard, AuthorizationGuard)
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    // @Authorize(HttpWorkspaceResource("VIEW ALL", "channelUuid"))
    @Authorize((context) => {
        return {
            domain: context.switchToHttp().getRequest().params.workspaceUuid as UUID,
            resource: context.switchToHttp().getRequest().params.channelUuid as UUID,
            action: "VIEW ALL"
        }
    })
    async getMessage(@Param("workspaceUuid") workspaceUuid: UUID, @Param("userUuid") userUuid: UUID, @Param("channelUuid") channelUuid) {
        const data = await this.messagesService.findAll();
        console.log(data)
        return data;
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
