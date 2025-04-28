import { SUP_GATEWAY_METADATA, SUP_GATEWAY_ROUTE_METADATA } from './constants';

/**
 * Décorateur pour marquer une classe comme un gestionnaire de passerelle WebSocket
 */
export function SupGateway(): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(SUP_GATEWAY_METADATA, SUP_GATEWAY_METADATA, target);
    };
}

/**
 * Décorateur pour marquer une méthode comme une route de passerelle WebSocket
 * @param route Nom de la route (événement) à gérer
 */
export function SupGatewayRoute(route: string): MethodDecorator {
    return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(SUP_GATEWAY_ROUTE_METADATA, route, descriptor.value);
        return descriptor;
    };
}
