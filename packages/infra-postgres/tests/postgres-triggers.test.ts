import * as fs from 'fs';
import * as path from 'path';

describe('PostgreSQL Advanced Invariants & Triggers Verification', () => {
  const triggersDir = path.resolve(__dirname, '../../../infra/postgres/triggers');

  it('Trigger 1: should contain valid SQL for DEFERRABLE INITIALLY DEFERRED ledger balance trigger', () => {
    const filePath = path.join(triggersDir, '01_ledger_balance_trigger.sql');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('CREATE CONSTRAINT TRIGGER trg_enforce_ledger_balance');
    expect(content).toContain('DEFERRABLE INITIALLY DEFERRED');
    expect(content).toContain('total_debits');
    expect(content).toContain('total_credits');
    expect(content).toContain('RAISE EXCEPTION');
  });

  it('Trigger 2: should contain valid SQL for append-only audit immutability trigger', () => {
    const filePath = path.join(triggersDir, '02_audit_immutability_trigger.sql');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('CREATE TRIGGER trg_audit_immutability');
    expect(content).toContain('BEFORE UPDATE OR DELETE ON audit_logs');
    expect(content).toContain('Audit records are strictly immutable and append-only');
  });

  it('Trigger 3: should contain valid SQL for 7-year statutory financial record retention rule', () => {
    const filePath = path.join(triggersDir, '03_retention_enforcement_trigger.sql');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('min_retention_days CONSTANT INT := 2555');
    expect(content).toContain('BEFORE DELETE ON ledger_entries');
    expect(content).toContain('BEFORE DELETE ON payments');
    expect(content).toContain('Retention policy violation');
  });
});
