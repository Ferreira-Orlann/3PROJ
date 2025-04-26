import { ClassSerializerInterceptor, ConsoleLogger } from "@nestjs/common";

import { NestFactory, Reflector } from "@nestjs/core";
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

    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {
        strategy: "excludeAll",
        excludeExtraneousValues: true,
    }))

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
