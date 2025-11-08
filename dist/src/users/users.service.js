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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const bcrypt = require("bcryptjs");
let UsersService = class UsersService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const exists = await this.repo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('E-mail já cadastrado');
        if (dto.isManager) {
            const alreadyManager = await this.repo.count({ where: { isManager: true } });
            if (alreadyManager > 0) {
                throw new common_1.BadRequestException('Já existe um gerente cadastrado. Apenas um gerente é permitido.');
            }
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const u = this.repo.create({
            name: dto.name,
            email: dto.email,
            password: passwordHash,
            balance: (dto.initialBalance ?? 0).toFixed(2),
            isManager: !!dto.isManager,
        });
        return this.repo.save(u);
    }
    async findByEmailWithPassword(email) {
        return this.repo
            .createQueryBuilder('u')
            .addSelect('u.password')
            .where('u.email = :email', { email })
            .getOne();
    }
    async findById(id) {
        const u = await this.repo.findOne({ where: { id } });
        if (!u)
            throw new common_1.NotFoundException('Usuário não encontrado');
        return u;
    }
    async list() {
        return this.repo.find();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
