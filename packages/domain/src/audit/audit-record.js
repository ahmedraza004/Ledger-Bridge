"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRecord = void 0;
const crypto = __importStar(require("crypto"));
class AuditRecord {
    id;
    tenantId;
    actor;
    action;
    entityType;
    entityId;
    beforeState;
    afterState;
    timestamp;
    correlationId;
    previousHash;
    hash;
    constructor(props) {
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
    calculateHash() {
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
    verifyIntegrity(expectedPreviousHash) {
        if (expectedPreviousHash && this.previousHash !== expectedPreviousHash) {
            return false;
        }
        return this.hash === this.calculateHash();
    }
}
exports.AuditRecord = AuditRecord;
//# sourceMappingURL=audit-record.js.map