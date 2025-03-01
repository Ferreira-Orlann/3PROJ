import { MetadataScanner, ModulesContainer } from "@nestjs/core";
import { SUP_GATEWAY_METADATA, SUP_GATEWAY_ROUTE_METADATA } from "./constants";
import { InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { Inject } from "@nestjs/common";

export class SupGatewayService {
    private readonly gateways: any[] = [];
    private readonly routes: Map<string, Function> = new Map<
        string,
        Function
    >();
    constructor(
        @Inject(ModulesContainer)
        private readonly moduleContainer: ModulesContainer,
    ) {}

    explore() {
        const modules = [...this.moduleContainer.values()];
        modules.forEach((moduleRef) => {
            [...moduleRef.providers.values()].forEach(
                (wrapper: InstanceWrapper) => {
                    const provider = wrapper.instance;
                    if (!provider || !provider.constructor) {
                        return;
                    }
                    const gateway_metadata = Reflect.getMetadata(
                        SUP_GATEWAY_METADATA,
                        provider.constructor,
                    );
                    if (gateway_metadata != SUP_GATEWAY_METADATA) {
                        return;
                    }
                    this.gateways.push(provider);
                    const prototype = Object.getPrototypeOf(provider);
                    const methodNames = new MetadataScanner().getAllMethodNames(
                        provider,
                    );
                    methodNames.forEach((methodName) => {
                        const method = prototype[methodName];
                        const methodMetadata = Reflect.getMetadata(
                            SUP_GATEWAY_ROUTE_METADATA,
                            method,
                        );
                        if (!methodMetadata) {
                            return;
                        }
                        this.routes.set(methodMetadata, method);
                    });
                },
            );
        });
    }

    getRouteCallback(route: string): Function | undefined {
        return this.routes.get(route);
    }
}
