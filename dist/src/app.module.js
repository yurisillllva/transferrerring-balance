"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_config_1 = require("./config/typeorm.config");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const wallet_module_1 = require("./wallet/wallet.module");
const health_controller_1 = require("./health/health.controller");
const metrics_controller_1 = require("./metrics/metrics.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({ useFactory: typeorm_config_1.typeOrmConfig }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            wallet_module_1.WalletModule
        ],
        controllers: [health_controller_1.HealthController, metrics_controller_1.MetricsController],
    })
], AppModule);
