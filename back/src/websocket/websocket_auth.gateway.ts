import { UseGuards } from "@nestjs/common";
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { AuthService } from "src/authentication/auth.service";
import { WebSocketAuthGuard } from "src/authentication/ws.auth.guard";

@WebSocketGateway()
export class WebSocketAuth {
    constructor(private readonly authService: AuthService) {}

    @SubscribeMessage("auth")
    @UseGuards(WebSocketAuthGuard)
    auth(@MessageBody() data) {}
}
