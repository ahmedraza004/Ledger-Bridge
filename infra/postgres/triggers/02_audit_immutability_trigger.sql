-- ==============================================================================
-- TRIGGER 2: AUDIT IMMUTABILITY TRIGGER (APPEND-ONLY)
-- Invariant: Records in audit_logs can NEVER be updated or deleted.
-- Any UPDATE or DELETE attempt must be immediately aborted.
-- ==============================================================================

CREATE OR REPLACE FUNCTION enforce_audit_immutability()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit records are strictly immutable and append-only. Operation % on audit_logs (ID: %) is prohibited by regulatory policy.',
        TG_OP,
        OLD.id
        USING ERRCODE = '42501'; -- insufficient_privilege / violation
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_immutability ON audit_logs;

CREATE TRIGGER trg_audit_immutability
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION enforce_audit_immutability();
