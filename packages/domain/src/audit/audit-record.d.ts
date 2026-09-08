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
export declare class AuditRecord {
    readonly id: string;
    readonly tenantId: string;
    readonly actor: string;
    readonly action: string;
    readonly entityType: string;
    readonly entityId: string;
    readonly beforeState: Record<string, unknown> | null;
    readonly afterState: Record<string, unknown> | null;
    readonly timestamp: Date;
    readonly correlationId: string;
    readonly previousHash: string;
    readonly hash: string;
    constructor(props: AuditRecordProps);
    private calculateHash;
    verifyIntegrity(expectedPreviousHash?: string): boolean;
}
//# sourceMappingURL=audit-record.d.ts.map