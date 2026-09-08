import { AuditRecord } from '../src/audit/audit-record';

describe('Audit System & Cryptographic Chain', () => {
  it('should create an immutable audit record with sha256 hash', () => {
    const record = new AuditRecord({
      id: 'audit-1',
      tenantId: 'tenant-1',
      actor: 'user@fintech.com',
      action: 'PAYMENT_CREATED',
      entityType: 'PAYMENT',
      entityId: 'pay-123',
      beforeState: null,
      afterState: { status: 'quoted', amount: '1000' }
    });

    expect(record.id).toBe('audit-1');
    expect(record.hash).toBeDefined();
    expect(record.hash.length).toBe(64); // SHA-256 hex length
    expect(record.verifyIntegrity()).toBe(true);
  });

  it('should chain previous hashes cryptographically', () => {
    const record1 = new AuditRecord({
      id: 'audit-1',
      tenantId: 'tenant-1',
      actor: 'system',
      action: 'ACCOUNT_OPENED',
      entityType: 'ACCOUNT',
      entityId: 'acc-1',
      afterState: { status: 'ACTIVE' }
    });

    const record2 = new AuditRecord({
      id: 'audit-2',
      tenantId: 'tenant-1',
      actor: 'user@fintech.com',
      action: 'PAYMENT_COMMITTED',
      entityType: 'PAYMENT',
      entityId: 'pay-1',
      previousHash: record1.hash,
      afterState: { status: 'committed' }
    });

    expect(record2.previousHash).toBe(record1.hash);
    expect(record2.verifyIntegrity(record1.hash)).toBe(true);
    // If wrong previous hash is provided, integrity fails
    expect(record2.verifyIntegrity('wrong-hash-123')).toBe(false);
  });
});
