import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = new Logger('Bootstrap');

  app.useLogger(logger);
  app.use(helmet());
  app.use(morgan('combined'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // <== chave da solução
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'Wallet API')
    .setDescription(process.env.SWAGGER_DESC || 'Carteira financeira')
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/doc', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`API rodando em http://localhost:${port}`);
  logger.log(` Swagger em http://localhost:${port}/api/doc`);
  logger.log(`Métricas em http://localhost:${port}/metrics`);
}
bootstrap();
