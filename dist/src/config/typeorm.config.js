"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const user_entity_1 = require("../users/user.entity");
const transaction_entity_1 = require("../wallet/transaction.entity");
const typeOrmConfig = async () => ({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'wallet',
    entities: [user_entity_1.User, transaction_entity_1.Transaction],
    synchronize: true,
    extra: { connectionLimit: 10 }
});
exports.typeOrmConfig = typeOrmConfig;
