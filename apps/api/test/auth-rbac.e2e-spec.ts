import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DomainExceptionFilter } from '../src/common/filters/domain-exception.filter';

describe('RBAC & Role Security (E2E)', () => {
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

  it('compliance_officer CAN sign off on compliance cases', async () => {
    const res = await request(app.getHttpServer())
      .post('/compliance/cases/decide')
      .set('Authorization', 'Bearer compliance')
      .send({
        caseId: 'case-demo-1',
        decision: 'APPROVED',
        reason: 'Enhanced due diligence verified through source of wealth documentation.',
        officerId: 'officer-sarah'
      });

    if (res.status !== 201) {
      console.error('DEBUG /compliance/cases/decide error:', res.body);
    }
    expect(res.status).toBe(201);

    expect(res.body.status).toBe('APPROVED');
    expect(res.body.officerId).toBe('officer-sarah');
  });

  it('standard customer role CANNOT access restricted compliance decision endpoint (403 Forbidden)', async () => {
    await request(app.getHttpServer())
      .post('/compliance/cases/decide')
      .set('Authorization', 'Bearer customer')
      .send({
        caseId: 'case-demo-1',
        decision: 'APPROVED',
        reason: 'Attempted unauthorized self-approval',
        officerId: 'customer-hacker'
      })
      .expect(403);
  });
});
