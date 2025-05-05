import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ClassSerializerInterceptor, ConsoleLogger, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: new ConsoleLogger("SupPhone"),
    });
    app.enableCors({
        origin: "http://localhost:5173", // Ou tu peux spécifier une liste d'origines, ex : ['http://192.168.1.102', 'http://tonAppMobile']
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Content-Type", "Authorization"],
        credentials: true, // Si tu utilises des cookies de session
    });

    const config = new DocumentBuilder()
        .setTitle("Docs")
        .setDescription("Api Docs")
        .setVersion("1.0")
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, documentFactory);

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector), {
            strategy: "excludeAll",
            excludeExtraneousValues: true,
        })
    );

    app.useGlobalPipes(new ValidationPipe());

    await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
