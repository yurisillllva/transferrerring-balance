# Transfererring Balance (Wallet API)

API de carteira financeira para **transferência de saldos** entre usuários, com **reversão** e **governança por gerente único**.  
Feita em **NestJS + TypeScript**, com **TypeORM (MySQL 5.7)**, **JWT**, **bcrypt**, **teste unitário e e2e em Jest**, **Swagger**, **métricas Prometheus** e **logs HTTP**.

## Objetivo Geral
Implementar uma carteira onde **apenas um usuário gerente** tem permissão para **executar operações**:
- **Transferir** saldo **de A → B** (debitando A e creditando B).
- **Retirar** saldo de um usuário **X → Gerente** (atalho).
- **Reverter** uma transferência (debita o recebedor e credita o remetente original).

Os **demais usuários** apenas **sofrem movimentações** ordenadas pelo gerente.  
Todas as operações financeiras rodam em **transação** com **row-level locking** e **rollback** em caso de falha.

## Tecnologias
- **Node.js / NestJS 10** (REST)
- **TypeScript**
- **TypeORM 0.3** (MySQL 5.7)
- **JWT** (`@nestjs/jwt`, `passport-jwt`)
- **bcryptjs** (hash de senha)
- **class-validator / class-transformer** (validação de DTO)
- **Swagger** (`@nestjs/swagger`)
- **prom-client** (métricas /metrics no padrão Prometheus)
- **morgan + Helmet** (logs HTTP e headers de segurança)
- **Jest + Supertest** (testes unitários e E2E)
- **Docker** (api + mysql)

## Modelagem de Dados
- **User**
  - `id (int, PK, auto-increment)`
  - `name`, `email (único)`, `password (hash)`, `balance (decimal)`, `isManager (bool)`
  - timestamps
- **Transaction**
  - `id (int, PK, auto-increment)`
  - `fromUser (FK)`, `toUser (FK)`
  - `amount (decimal)`, `type ('TRANSFER' | 'REVERSAL')`, `status ('COMPLETED' | 'REVERSED')`
  - `reversalOf (int, nullable)` → ID da transação original
  - timestamps

## Regras de Negócio
- **Somente o gerente** pode chamar:
  - `POST /wallet/transfer` (debitando **A** e creditando **B**)
  - `POST /wallet/withdraw` (debitando **X** e creditando **Gerente**)
  - `POST /wallet/reverse` (reversão de uma transferência)
- **Validações**: saldo suficiente do debitado, usuários existentes, transação passível de reversão, etc.
- **Consistência**: operações em **transação** com `pessimistic_write` nas linhas de `users` para evitar corrida.

## Padrões e SOLID
- **DTO + Validation**: contrato de entrada explícito e seguro.
- **SRP (Single Responsibility)**: `UsersService` e `WalletService` com responsabilidades focadas.
- **DIP (Dependency Inversion)**: serviços dependem de repositórios injetados (`TypeORM`), facilitando testes.
- **Repository Pattern** (TypeORM): acesso a dados centralizado e consistente.
- **Strategy**: `JwtStrategy` isola autenticação por token.
- **Layered Architecture**: Controller → Service → Repository/DB.

## Monitoramento e Logging
- **/metrics**: métricas padrão via `prom-client` (Prometheus).
- **morgan**: access log no formato `combined`.
- **Helmet**: headers de segurança.
- **ValidationPipe** global com `whitelist` e `transform`.

## Rotas Principais
- `POST /users` — cria usuário (use `isManager: true` para o **único** gerente)
- `GET /users` — lista usuários (mostra `balance`)
- `POST /auth/login` — autentica e retorna JWT
- `POST /wallet/transfer` — **gerente** transfere **A → B**
- `POST /wallet/withdraw` — **gerente** retira **X → Gerente**
- `POST /wallet/reverse` — **gerente** reverte uma transferência
- `GET /wallet/transactions/:userId` — últimas transações do usuário
- `GET /health` — liveness
- `GET /metrics` — métricas Prometheus
- **Swagger**: `/api/doc`

## Como Rodar (Docker)

> Se sua máquina já usa MySQL local em 3306, o compose expõe o MySQL do container em **3307**.

```bash
cp .env.example .env
docker compose up --build

Rodar teste unitário: npm test
Rodar teste de cobertura: npm run test:cov

API: http://localhost:3000

Swagger: http://localhost:3000/api/doc

Health: http://localhost:3000/health

Métricas (Prometheus): http://localhost:3000/metrics
