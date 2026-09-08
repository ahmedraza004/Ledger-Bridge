-- ==============================================================================
-- TRIGGER 3: FINANCIAL RECORD RETENTION RULE
-- Invariant: Ledger entries and payments cannot be deleted prior to the
-- statutory 7-year retention period (2555 days).
-- ==============================================================================

CREATE OR REPLACE FUNCTION enforce_financial_retention()
RETURNS TRIGGER AS $$
DECLARE
    min_retention_days CONSTANT INT := 2555; -- 7 Years
    record_age_days INT;
BEGIN
    record_age_days := EXTRACT(DAY FROM (NOW() - OLD.created_at));
    
    IF record_age_days < min_retention_days THEN
        RAISE EXCEPTION 'Retention policy violation: Financial record % cannot be deleted before the legal retention period of 7 years (Age: % days).',
            OLD.id,
            record_age_days
            USING ERRCODE = '23514';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ledger_retention ON ledger_entries;

CREATE TRIGGER trg_ledger_retention
BEFORE DELETE ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION enforce_financial_retention();

DROP TRIGGER IF EXISTS trg_payment_retention ON payments;

CREATE TRIGGER trg_payment_retention
BEFORE DELETE ON payments
FOR EACH ROW
EXECUTE FUNCTION enforce_financial_retention();
