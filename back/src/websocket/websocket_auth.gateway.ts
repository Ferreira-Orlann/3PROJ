import { UseGuards } from "@nestjs/common";
import { MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { WebSocketAuthGuard } from "src/authentication/ws.auth.guard";

@WebSocketGateway()
export class WebSocketAuth {
    @SubscribeMessage("auth")
    @UseGuards(WebSocketAuthGuard)
    auth(@MessageBody() data) {
        console.log(data)
        console.log(typeof(data))
    }
}