-- ==============================================================================
-- TRIGGER 1: LEDGER BALANCE ENFORCEMENT (DEFERRABLE INITIALLY DEFERRED)
-- Invariant: For every ledger entry, sum of DEBIT postings MUST equal sum of
-- CREDIT postings for each distinct currency group at transaction COMMIT.
-- ==============================================================================

CREATE OR REPLACE FUNCTION verify_ledger_entry_balance()
RETURNS CONSTRAINT TRIGGER AS $$
DECLARE
    unbalanced_record RECORD;
BEGIN
    -- Check if any modified or inserted posting belongs to an unbalanced entry
    FOR unbalanced_record IN
        SELECT 
            p.ledger_entry_id,
            p.currency,
            SUM(CASE WHEN p.direction = 'DEBIT' THEN p.amount_minor ELSE 0 END) AS total_debits,
            SUM(CASE WHEN p.direction = 'CREDIT' THEN p.amount_minor ELSE 0 END) AS total_credits
        FROM postings p
        WHERE p.ledger_entry_id IN (
            SELECT DISTINCT ledger_entry_id FROM postings
        )
        GROUP BY p.ledger_entry_id, p.currency
        HAVING SUM(CASE WHEN p.direction = 'DEBIT' THEN p.amount_minor ELSE 0 END) <>
               SUM(CASE WHEN p.direction = 'CREDIT' THEN p.amount_minor ELSE 0 END)
    LOOP
        RAISE EXCEPTION 'Ledger balance invariant violation: Ledger entry % is unbalanced in currency %. Total Debits: %, Total Credits: %',
            unbalanced_record.ledger_entry_id,
            unbalanced_record.currency,
            unbalanced_record.total_debits,
            unbalanced_record.total_credits
            USING ERRCODE = '23514'; -- check_violation
    END LOOP;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_ledger_balance ON postings;

CREATE CONSTRAINT TRIGGER trg_enforce_ledger_balance
AFTER INSERT OR UPDATE OR DELETE ON postings
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION verify_ledger_entry_balance();
