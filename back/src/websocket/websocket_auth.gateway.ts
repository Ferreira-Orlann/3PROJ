import { UseGuards } from "@nestjs/common";
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { AuthService } from "src/authentication/authentication.service";
import { WebSocketAuthGuard } from "src/authentication/ws.authentication.guard";

@WebSocketGateway()
export class WebSocketAuth {
    constructor(private readonly authService: AuthService) {}

    @SubscribeMessage("auth")
    @UseGuards(WebSocketAuthGuard)
    auth(@MessageBody() data) {}
}
