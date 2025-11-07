import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('Wallet - gerente único', () => {
  let app: INestApplication;
  let ds: DataSource;

  let manager: any;
  let alice: any;
  let bob: any;
  let managerToken: string;
  let aliceToken: string;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modRef.createNestApplication();
    await app.init();

    ds = app.get(DataSource);
    await ds.query('SET FOREIGN_KEY_CHECKS=0;');
    await ds.query('TRUNCATE TABLE transactions;');
    await ds.query('TRUNCATE TABLE users;');
    await ds.query('SET FOREIGN_KEY_CHECKS=1;');

    // cria gerente único
    const r1 = await request(app.getHttpServer()).post('/users').send({
      name: 'Gerente', email: 'manager@ex.com', password: 'Senha123', initialBalance: 1000, isManager: true
    }).expect(201);
    manager = r1.body;

    // cria usuários comuns
    const r2 = await request(app.getHttpServer()).post('/users').send({
      name: 'Alice', email: 'alice@ex.com', password: 'Senha123', initialBalance: 0
    }).expect(201);
    alice = r2.body;

    const r3 = await request(app.getHttpServer()).post('/users').send({
      name: 'Bob', email: 'bob@ex.com', password: 'Senha123', initialBalance: 0
    }).expect(201);
    bob = r3.body;

    // login gerente
    const lg1 = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'manager@ex.com', password: 'Senha123'
    }).expect(201);
    managerToken = lg1.body.access_token;

    // login alice (não-gerente)
    const lg2 = await request(app.getHttpServer()).post('/auth/login').send({
      email: 'alice@ex.com', password: 'Senha123'
    }).expect(201);
    aliceToken = lg2.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Somente gerente pode TRANSFERIR (200) e não-gerente deve falhar (403)', async () => {
    // gerente transfere 200 para Alice
    const tx = await request(app.getHttpServer())
      .post('/wallet/transfer')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ toUserId: alice.id, amount: 200 })
      .expect(201);
    expect(tx.body.type).toBe('TRANSFER');

    // Alice (não-gerente) tenta transferir -> 403
    await request(app.getHttpServer())
      .post('/wallet/transfer')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ toUserId: bob.id, amount: 10 })
      .expect(403);
  });

  it('Somente gerente pode WITHDRAW (retirar) e reverter', async () => {
    // gerente retira 50 da Alice para o gerente
    const wd = await request(app.getHttpServer())
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ fromUserId: alice.id, amount: 50 })
      .expect(201);
    expect(wd.body.type).toBe('TRANSFER');

    // gerente reverte a primeira transferência
    const listAlice = await request(app.getHttpServer())
      .get(`/wallet/transactions/${alice.id}`)
      .expect(200);
    const originalTx = listAlice.body.find((t: any) => t.type === 'TRANSFER' && t.status === 'COMPLETED');

    const rev = await request(app.getHttpServer())
      .post('/wallet/reverse')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ transactionId: originalTx.id })
      .expect(201);
    expect(rev.body.type).toBe('REVERSAL');

    // Alice tenta withdraw -> 403
    await request(app.getHttpServer())
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ fromUserId: bob.id, amount: 10 })
      .expect(403);
  });
});
