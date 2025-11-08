"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const morgan = require("morgan");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const logger = new common_1.Logger('Bootstrap');
    app.useLogger(logger);
    app.use((0, helmet_1.default)());
    app.use(morgan('combined'));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle(process.env.SWAGGER_TITLE || 'Wallet API')
        .setDescription(process.env.SWAGGER_DESC || 'Carteira financeira')
        .setVersion(process.env.SWAGGER_VERSION || '1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/doc', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`API rodando em http://localhost:${port}`);
    logger.log(` Swagger em http://localhost:${port}/api/doc`);
    logger.log(`Métricas em http://localhost:${port}/metrics`);
}
bootstrap();
