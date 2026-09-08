import * as crypto from 'crypto';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

export interface IdempotencyRecord {
  key: string;
  tenantId: string;
  requestHash: string;
  responseBody: unknown;
  statusCode: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  expiresAt: Date;
}

export class IdempotencyService {
  private inMemoryStore = new Map<string, IdempotencyRecord>();

  public calculateRequestHash(payload: unknown): string {
    const serialized = JSON.stringify(payload, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    });
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  public async acquireLock(
    key: string,
    tenantId: string,
    payload: unknown,
    ttlSeconds: number = 300
  ): Promise<{ record?: IdempotencyRecord; isNew: boolean }> {
    const requestHash = this.calculateRequestHash(payload);
    const storeKey = `${tenantId}:${key}`;
    const existing = this.inMemoryStore.get(storeKey);

    if (existing) {
      if (existing.requestHash !== requestHash) {
        throw new DomainError(
          ErrorCode.IDEMPOTENCY_PAYLOAD_MISMATCH,
          `Idempotency key '${key}' was previously used with a different request payload.`
        );
      }

      if (existing.status === 'PROCESSING') {
        throw new DomainError(
          ErrorCode.IDEMPOTENCY_KEY_IN_USE,
          `A request with idempotency key '${key}' is currently being processed. Please retry shortly.`
        );
      }

      return { record: existing, isNew: false };
    }

    const newRecord: IdempotencyRecord = {
      key,
      tenantId,
      requestHash,
      responseBody: null,
      statusCode: 202,
      status: 'PROCESSING',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ttlSeconds * 1000)
    };

    this.inMemoryStore.set(storeKey, newRecord);
    return { record: newRecord, isNew: true };
  }

  public async saveResponse(
    key: string,
    tenantId: string,
    responseBody: unknown,
    statusCode: number = 200
  ): Promise<void> {
    const storeKey = `${tenantId}:${key}`;
    const existing = this.inMemoryStore.get(storeKey);
    if (existing) {
      existing.responseBody = responseBody;
      existing.statusCode = statusCode;
      existing.status = 'COMPLETED';
    }
  }

  public async markFailed(key: string, tenantId: string): Promise<void> {
    const storeKey = `${tenantId}:${key}`;
    const existing = this.inMemoryStore.get(storeKey);
    if (existing) {
      existing.status = 'FAILED';
    }
  }

  public clear(): void {
    this.inMemoryStore.clear();
  }
}
