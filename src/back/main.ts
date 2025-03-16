import { ConsoleLogger } from "@nestjs/common";
import { Tracing } from "@amplication/opentelemetry-nestjs";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";

Tracing.init({
    serviceName: "supphone-back",
    metricReader: new PrometheusExporter({
        endpoint: "/metrics",
        port: 9900,
    }),
    instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new NestInstrumentation(),
    ],
});

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger("SupPhone"),
    });
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle("Docs")
        .setDescription("Api Docs")
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
