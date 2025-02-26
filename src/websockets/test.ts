import { Injectable } from "@nestjs/common";
import { SupWebsocketGateway } from "./decorators/sup.gateway.decorator";
import { SupWebsocketGatewayRoute } from "./decorators/sup.gateway.route.decorator";

@Injectable()
@SupWebsocketGateway()
export class Test {
    @SupWebsocketGatewayRoute("test")
    test() {
        console.log("test route")
    }
}