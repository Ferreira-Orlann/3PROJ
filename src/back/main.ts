import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ConsoleLogger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger('SupPhone'), 
  });

  app.enableCors(); 

  app.setGlobalPrefix('api'); 

  // ✅ Setup Swagger (docs API)
  const config = new DocumentBuilder()
    .setTitle('Docs')
    .setDescription('API Docs de SupChat')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); 

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      strategy: 'excludeAll',
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
