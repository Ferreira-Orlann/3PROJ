import { NotFoundException, UseGuards } from "@nestjs/common";
import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
} from "@nestjs/websockets";
import { SupGatewayService } from "./supgateway.service";
import { WebSocketAuthGuard } from "../authentication/ws.authentication.guard";

@WebSocketGateway()
export class WebSocketAuth {
    constructor(private readonly supGatewayService: SupGatewayService) {}

    @SubscribeMessage("message")
    @UseGuards(WebSocketAuthGuard)
    message(@MessageBody() data) {
        const callback = this.supGatewayService.getRouteCallback(data.message);
        console.log("Route Callback", callback);
        if (!callback) {
            throw new NotFoundException(`Route "${data.message}" is unknown.`);
        }
        callback(data);
    }
}
