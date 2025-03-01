import { Reflector } from "@nestjs/core";
import { SUP_GATEWAY_ROUTE_METADATA } from "../constants";

export const SupWebsocketGatewayRoute = Reflector.createDecorator<string>({
    key: SUP_GATEWAY_ROUTE_METADATA,
});
