import * as crypto from 'crypto';

export interface AuditRecordProps {
  id: string;
  tenantId: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  timestamp?: Date;
  correlationId?: string;
  previousHash?: string;
}

export class AuditRecord {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly actor: string;
  public readonly action: string;
  public readonly entityType: string;
  public readonly entityId: string;
  public readonly beforeState: Record<string, unknown> | null;
  public readonly afterState: Record<string, unknown> | null;
  public readonly timestamp: Date;
  public readonly correlationId: string;
  public readonly previousHash: string;
  public readonly hash: string;

  constructor(props: AuditRecordProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.actor = props.actor;
    this.action = props.action;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.beforeState = props.beforeState ?? null;
    this.afterState = props.afterState ?? null;
    this.timestamp = props.timestamp ?? new Date();
    this.correlationId = props.correlationId ?? crypto.randomUUID();
    this.previousHash = props.previousHash ?? '0'.repeat(64);
    this.hash = this.calculateHash();

    Object.freeze(this);
  }

  private calculateHash(): string {
    const payload = JSON.stringify({
      id: this.id,
      tenantId: this.tenantId,
      actor: this.actor,
      action: this.action,
      entityType: this.entityType,
      entityId: this.entityId,
      beforeState: this.beforeState,
      afterState: this.afterState,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      previousHash: this.previousHash
    });

    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  public verifyIntegrity(expectedPreviousHash?: string): boolean {
    if (expectedPreviousHash && this.previousHash !== expectedPreviousHash) {
      return false;
    }
    return this.hash === this.calculateHash();
  }
}
