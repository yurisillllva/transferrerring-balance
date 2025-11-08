import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('Wallet - gerente único (A -> B) (E2E)', () => {
  let app: INestApplication;
  let ds: DataSource;

  let manager: any;
  let alice: any;
  let bob: any;
  let managerToken: string;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modRef.createNestApplication();
    await app.init();

    ds = app.get(DataSource);
    await ds.query('SET FOREIGN_KEY_CHECKS=0;');
    await ds.query('TRUNCATE TABLE transactions;');
    await ds.query('TRUNCATE TABLE users;');
    await ds.query('SET FOREIGN_KEY_CHECKS=1;');

    manager = (await request(app.getHttpServer()).post('/users').send({
      name: 'Gerente', email: 'manager@ex.com', password: 'Senha123', initialBalance: 0, isManager: true
    }).expect(201)).body;

    alice = (await request(app.getHttpServer()).post('/users').send({
      name: 'Alice', email: 'alice@ex.com', password: 'Senha123', initialBalance: 500
    }).expect(201)).body;

    bob = (await request(app.getHttpServer()).post('/users').send({
      name: 'Bob', email: 'bob@ex.com', password: 'Senha123', initialBalance: 0
    }).expect(201)).body;

    managerToken = (await request(app.getHttpServer()).post('/auth/login').send({
      email: 'manager@ex.com', password: 'Senha123'
    }).expect(201)).body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('Somente gerente pode TRANSFERIR A->B; id numérico em transactions', async () => {
    const tx = await request(app.getHttpServer())
      .post('/wallet/transfer')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ fromUserId: alice.id, toUserId: bob.id, amount: 200 })
      .expect(201);

    expect(typeof tx.body.id).toBe('number');
    expect(tx.body.id).toBeGreaterThanOrEqual(1);
    expect(tx.body.type).toBe('TRANSFER');
  });

  it('WITHDRAW (X -> Gerente) e REVERSE por gerente', async () => {
    const wd = await request(app.getHttpServer())
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ fromUserId: bob.id, amount: 50 })
      .expect(201);
    expect(typeof wd.body.id).toBe('number');

    const listAlice = await request(app.getHttpServer())
      .get(`/wallet/transactions/${alice.id}`)
      .expect(200);
    const firstTx = listAlice.body.find((t: any) => t.type === 'TRANSFER' && t.status === 'COMPLETED');

    const rev = await request(app.getHttpServer())
      .post('/wallet/reverse')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ transactionId: firstTx.id })
      .expect(201);

    expect(rev.body.type).toBe('REVERSAL');
    expect(typeof rev.body.id).toBe('number');
  });
});
