# Architecture Decision Records (ADRs) - LedgerBridge

## ADR-001: Minor-Unit BigInt Representation for Currency and Money
- **Status**: Accepted
- **Context**: Standard floating-point arithmetic (IEEE 754 float/double) is prone to binary rounding errors (e.g. `0.1 + 0.2 !== 0.3`). In financial systems, a fractional cent discrepancy violates accounting invariants and creates reconciliation failures.
- **Decision**: All monetary values are strictly represented as integers (`bigint`) of the currency's minor unit (e.g., cents for USD/EUR, halalas for SAR). Floating-point arithmetic is forbidden in the domain layer. Prorated allocations use integer remainder distribution to ensure $\sum \text{Allocations} \equiv \text{Total}$.
- **Consequences**: Zero rounding drift, exact double-entry ledger balance, ISO-4217 minor unit adherence.

---

## ADR-002: PostgreSQL Deferred Balance Invariant (`DEFERRABLE INITIALLY DEFERRED`)
- **Status**: Accepted
- **Context**: A multi-legged journal entry consists of multiple individual SQL `INSERT` statements for postings. Checking debits = credits on every row insertion causes immediate constraint violations on the first leg.
- **Decision**: Implement a database constraint trigger configured with `DEFERRABLE INITIALLY DEFERRED`. PostgreSQL defers the sum validation until the outer transaction `COMMIT` boundary.
- **Consequences**: If debits do not equal credits for any modified ledger entry, PostgreSQL aborts the entire transaction. Application bugs cannot corrupt financial ledgers.

---

## ADR-003: Hexagonal Architecture (Ports & Adapters) & Universal Contract Testing
- **Status**: Accepted
- **Context**: Real fintech systems interact with diverse external providers (FX, KYC, AML, payment rails). Tight coupling prevents unit testing and rapid provider switching.
- **Decision**: Define 6 strict port interfaces (`KycProvider`, `AmlProvider`, `CompanyVerificationProvider`, `FxProvider`, `PaymentRailProvider`, `RegulatoryProvider`). Build universal `ProviderContractTest` suites that execute identically against sandbox and production adapters.
- **Consequences**: Pluggable vendor integrations, zero external network dependency during CI, 100% contract compliance.

---

## ADR-004: Two-Phase Idempotency System with SHA-256 Payload Hashes
- **Status**: Accepted
- **Context**: Network retries and client reconnections can lead to duplicate payment execution and double charging.
- **Decision**: Implement a two-phase idempotency gate. 
  1. Phase 1: Atomically acquire an idempotency lock for `(tenantId, idempotencyKey)` with the SHA-256 hash of the payload. Concurrent duplicate requests receive HTTP 409 Conflict.
  2. Phase 2: Store the final HTTP status code and response body upon transaction completion. Subsequent identical requests return the cached response.
- **Consequences**: Safe client retries, zero double debits, transparent duplicate handling.

---

## ADR-005: Cryptographically Hashed Append-Only Audit Trail
- **Status**: Accepted
- **Context**: Regulatory authorities (FinCEN, FCA, SAMA) mandate that audit trails cannot be altered or retroactively manipulated.
- **Decision**: Implement `AuditRecord` with parent hash chaining (`previousHash` + `hash = SHA256(...)`) and enforce a PostgreSQL database trigger aborting all `UPDATE` and `DELETE` operations on `audit_logs`.
- **Consequences**: Tamper-evident ledger history, regulatory compliance, zero silent data mutations.
