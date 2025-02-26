import { Reflector } from "@nestjs/core";
import { SUP_GATEWAY_METADATA } from "../constants";
import { SetMetadata } from "@nestjs/common";

export const SupWebsocketGateway = () => {
    return (constructor) => Reflect.defineMetadata(SUP_GATEWAY_METADATA, SUP_GATEWAY_METADATA, constructor)
}