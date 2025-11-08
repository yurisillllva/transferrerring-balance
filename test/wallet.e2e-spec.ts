import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { DataSource } from 'typeorm';

describe('Wallet - fluxo completo (E2E)', () => {
  let app: INestApplication;
  let ds: DataSource;

  let manager: any;
  let alice: any;
  let bob: any;
  let managerToken: string;
  let aliceToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    ds = app.get(DataSource);

    // Zera tabelas
    await ds.query('SET FOREIGN_KEY_CHECKS=0;');
    await ds.query('TRUNCATE TABLE transactions;');
    await ds.query('TRUNCATE TABLE users;');
    await ds.query('SET FOREIGN_KEY_CHECKS=1;');

    // Criar gerente
    const r1 = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Gerente',
        email: 'manager@ex.com',
        password: 'Senha123',
        initialBalance: 1000,
        isManager: true,
      })
      .expect(201);

    manager = r1.body;

    // Criar Alice
    const r2 = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Alice',
        email: 'alice@ex.com',
        password: 'Senha123',
        initialBalance: 500,
      })
      .expect(201);

    alice = r2.body;

    // Criar Bob
    const r3 = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Bob',
        email: 'bob@ex.com',
        password: 'Senha123',
        initialBalance: 0,
      })
      .expect(201);

    bob = r3.body;

    // Login gerente
    const lg1 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'manager@ex.com',
        password: 'Senha123',
      })
      .expect(201);

    managerToken = lg1.body.access_token;

    // Login Alice (não gerente)
    const lg2 = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'alice@ex.com',
        password: 'Senha123',
      })
      .expect(201);

    aliceToken = lg2.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  // ---------------------------------------------------------
  // TESTE 1 — Transferência A -> B (somente gerente)
  // ---------------------------------------------------------
  it('Somente gerente pode TRANSFERIR A->B e não-gerente recebe 403', async () => {
    // Gerente transfere de Alice -> Bob
    const tx = await request(app.getHttpServer())
      .post('/wallet/transfer')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        fromUserId: alice.id,
        toUserId: bob.id,
        amount: 200,
      })
      .expect(201);

    // ID deve ser inteiro auto increment
    expect(typeof tx.body.id).toBe('number');
    expect(tx.body.id).toBe(1);
    expect(tx.body.type).toBe('TRANSFER');

    // Não-gerente tentando — deve falhar
    await request(app.getHttpServer())
      .post('/wallet/transfer')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        fromUserId: alice.id,
        toUserId: bob.id,
        amount: 10,
      })
      .expect(403);
  });

  // ---------------------------------------------------------
  // TESTE 2 — Withdraw e Reverse
  // ---------------------------------------------------------
  it('WITHDRAW (X -> Gerente) e REVERSE por gerente', async () => {
    // Withdraw — debita de Bob -> gerente
    const wd = await request(app.getHttpServer())
      .post('/wallet/withdraw')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        fromUserId: bob.id,
        amount: 50,
      })
      .expect(201);

    expect(wd.body.type).toBe('TRANSFER');
    expect(typeof wd.body.id).toBe('number');

    // Listar transações da Alice -> pegar transação original
    const listAlice = await request(app.getHttpServer())
      .get(`/wallet/transactions/${alice.id}`)
      .expect(200);

    const firstTx = listAlice.body.find(
      (t: any) => t.type === 'TRANSFER' && t.status === 'COMPLETED',
    );

    expect(firstTx).toBeDefined();
    expect(typeof firstTx.id).toBe('number');

    // Reverter
    const rev = await request(app.getHttpServer())
      .post('/wallet/reverse')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        transactionId: firstTx.id,
      })
      .expect(201);

    expect(rev.body.type).toBe('REVERSAL');
    expect(typeof rev.body.id).toBe('number');
    expect(rev.body.reversalOf).toBe(firstTx.id);
  });
});
