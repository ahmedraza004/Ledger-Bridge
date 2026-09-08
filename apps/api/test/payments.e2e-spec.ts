import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';

describe('LedgerBridge Payment API (E2E Lifecycle)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /admin/health should return system status UP', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/health')
      .expect(200);

    expect(res.body.status).toBe('UP');
    expect(res.body.service).toBe('LedgerBridge API');
  });

  it('GET /admin/metrics should export Prometheus metrics', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/metrics')
      .expect(200);

    expect(res.text).toContain('ledgerbridge_payments_processed_total');
  });

  it('POST /quotes should create a guaranteed FX quote', async () => {
    const res = await request(app.getHttpServer())
      .post('/quotes')
      .send({
        tenantId: 'tenant-e2e-1',
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
        sourceAmountMinor: '100000' // $1,000.00
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.targetCurrency).toBe('EUR');
    expect(res.body.exchangeRate).toBeGreaterThan(0);
  });

  it('POST /accounts should create source and destination accounts', async () => {
    const sourceRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', 'Bearer admin')
      .send({
        tenantId: 'tenant-e2e-1',
        name: 'E2E Alice Treasury',
        type: 'ASSET',
        currency: 'USD'
      })
      .expect(201);

    const destRes = await request(app.getHttpServer())
      .post('/accounts')
      .set('Authorization', 'Bearer admin')
      .send({
        tenantId: 'tenant-e2e-1',
        name: 'E2E Bob Payee',
        type: 'LIABILITY',
        currency: 'USD'
      })
      .expect(201);

    expect(sourceRes.body.id).toBeDefined();
    expect(destRes.body.id).toBeDefined();

    // Verify created accounts can be queried
    const getRes = await request(app.getHttpServer())
      .get(`/accounts/${sourceRes.body.id}`)
      .expect(200);

    expect(getRes.body.name).toBe('E2E Alice Treasury');
  });

  it('POST /admin/seed should seed realistic accounts and payments', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/seed?tenantId=tenant-demo')
      .expect(201);

    expect(res.body.accountsSeeded).toBe(10);
    expect(res.body.paymentsSeeded).toBe(20);
  });
});
