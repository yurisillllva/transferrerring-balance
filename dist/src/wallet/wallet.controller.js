"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const wallet_service_1 = require("./wallet.service");
const transfer_dto_1 = require("./dto/transfer.dto");
const reversal_dto_1 = require("./dto/reversal.dto");
const withdraw_dto_1 = require("./dto/withdraw.dto");
const passport_1 = require("@nestjs/passport");
let WalletController = class WalletController {
    constructor(service) {
        this.service = service;
    }
    async transfer(req, dto) {
        const tx = await this.service.transfer(req.user.userId, dto.fromUserId, dto.toUserId, dto.amount);
        return tx;
    }
    async withdraw(req, dto) {
        const tx = await this.service.withdraw(req.user.userId, dto.fromUserId, dto.amount);
        return tx;
    }
    async reverse(req, dto) {
        return this.service.reverse(req.user.userId, Number(dto.transactionId));
    }
    async list(userId) {
        return this.service.listByUser(userId);
    }
};
exports.WalletController = WalletController;
__decorate([
    (0, common_1.Post)('transfer'),
    (0, swagger_1.ApiOkResponse)({ description: 'Transferência realizada (somente gerente)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, transfer_dto_1.TransferDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    (0, swagger_1.ApiOkResponse)({ description: 'Retirada realizada (somente gerente)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, withdraw_dto_1.WithdrawDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Post)('reverse'),
    (0, swagger_1.ApiOkResponse)({ description: 'Reversão realizada (somente gerente)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reversal_dto_1.ReversalDto]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "reverse", null);
__decorate([
    (0, common_1.Get)('transactions/:userId'),
    (0, swagger_1.ApiOkResponse)({ description: 'Últimas transações do usuário' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WalletController.prototype, "list", null);
exports.WalletController = WalletController = __decorate([
    (0, swagger_1.ApiTags)('wallet'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('wallet'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService])
], WalletController);
