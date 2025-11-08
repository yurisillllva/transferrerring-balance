# Wallet API (NestJS)

Carteira financeira com **transferência** e **reversão**, usando **NestJS + TypeORM (MySQL 5.7)**, **JWT**, **bcrypt**, **Jest (unit + e2e)**, **Swagger**, **logs** e **/metrics**.

## Subir com Docker

```bash
cp .env.example .env
docker-compose up --build

API: http://localhost:3000

Swagger: http://localhost:3000/api/doc

Health: http://localhost:3000/health

Métricas (Prometheus): http://localhost:3000/metrics
