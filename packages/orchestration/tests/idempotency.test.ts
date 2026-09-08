import { IdempotencyService } from '../src/idempotency/idempotency.service';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

describe('Distributed Idempotency & Replay Prevention Service', () => {
  let service: IdempotencyService;

  beforeEach(() => {
    service = new IdempotencyService();
  });

  it('should acquire lock for a new request', async () => {
    const payload = { accountId: 'acc-1', amount: '1000' };
    const res = await service.acquireLock('key-1', 'tenant-1', payload);

    expect(res.isNew).toBe(true);
    expect(res.record?.status).toBe('PROCESSING');
  });

  it('should reject concurrent duplicate request with IDEMPOTENCY_KEY_IN_USE', async () => {
    const payload = { accountId: 'acc-1', amount: '1000' };
    await service.acquireLock('key-2', 'tenant-1', payload);

    await expect(service.acquireLock('key-2', 'tenant-1', payload)).rejects.toThrow(DomainError);
    await expect(service.acquireLock('key-2', 'tenant-1', payload)).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.IDEMPOTENCY_KEY_IN_USE })
    );
  });

  it('should reject reused idempotency key with different payload with IDEMPOTENCY_PAYLOAD_MISMATCH', async () => {
    const payload1 = { accountId: 'acc-1', amount: '1000' };
    const payload2 = { accountId: 'acc-2', amount: '5000' };

    await service.acquireLock('key-3', 'tenant-1', payload1);
    await service.saveResponse('key-3', 'tenant-1', { status: 'success' });

    await expect(service.acquireLock('key-3', 'tenant-1', payload2)).rejects.toThrow(DomainError);
    await expect(service.acquireLock('key-3', 'tenant-1', payload2)).rejects.toThrow(
      expect.objectContaining({ code: ErrorCode.IDEMPOTENCY_PAYLOAD_MISMATCH })
    );
  });

  it('should return cached response for completed identical request without double charging', async () => {
    const payload = { accountId: 'acc-1', amount: '1000' };
    await service.acquireLock('key-4', 'tenant-1', payload);
    await service.saveResponse('key-4', 'tenant-1', { paymentId: 'pay-cached-123' }, 200);

    const replayed = await service.acquireLock('key-4', 'tenant-1', payload);
    expect(replayed.isNew).toBe(false);
    expect(replayed.record?.status).toBe('COMPLETED');
    expect(replayed.record?.responseBody).toEqual({ paymentId: 'pay-cached-123' });
  });
});
