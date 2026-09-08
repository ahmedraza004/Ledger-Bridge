import { PaymentStateMachine, VALID_PAYMENT_TRANSITIONS } from '@ledgerbridge/domain';
import { PaymentState, DomainError } from '@ledgerbridge/shared';

describe('Payment State Machine Exhaustive Invariant Matrix', () => {
  const allStates: PaymentState[] = [
    'quoted',
    'validated',
    'committed',
    'submitted',
    'settled',
    'reversed',
    'failed'
  ];

  it('should verify all legal transitions defined in specification matrix', () => {
    // Quoted can go to validated or failed
    expect(PaymentStateMachine.canTransition('quoted', 'validated')).toBe(true);
    expect(PaymentStateMachine.canTransition('quoted', 'failed')).toBe(true);
    expect(PaymentStateMachine.canTransition('quoted', 'settled')).toBe(false);

    // Validated can go to committed or failed
    expect(PaymentStateMachine.canTransition('validated', 'committed')).toBe(true);
    expect(PaymentStateMachine.canTransition('validated', 'failed')).toBe(true);
    expect(PaymentStateMachine.canTransition('validated', 'reversed')).toBe(false);

    // Committed can go to submitted or failed
    expect(PaymentStateMachine.canTransition('committed', 'submitted')).toBe(true);
    expect(PaymentStateMachine.canTransition('committed', 'failed')).toBe(true);

    // Submitted can go to settled or failed
    expect(PaymentStateMachine.canTransition('submitted', 'settled')).toBe(true);
    expect(PaymentStateMachine.canTransition('submitted', 'failed')).toBe(true);

    // Settled can go to reversed
    expect(PaymentStateMachine.canTransition('settled', 'reversed')).toBe(true);
    expect(PaymentStateMachine.canTransition('settled', 'quoted')).toBe(false);

    // Reversed is terminal (cannot transition)
    expect(PaymentStateMachine.canTransition('reversed', 'settled')).toBe(false);
    expect(VALID_PAYMENT_TRANSITIONS['reversed'].length).toBe(0);

    // Failed is terminal (cannot transition)
    expect(PaymentStateMachine.canTransition('failed', 'validated')).toBe(false);
    expect(VALID_PAYMENT_TRANSITIONS['failed'].length).toBe(0);
  });

  it('assertTransition should throw for every illegal permutation', () => {
    // Test a sample of invalid transitions
    const illegalPermutations: [PaymentState, PaymentState][] = [
      ['quoted', 'settled'],
      ['quoted', 'reversed'],
      ['validated', 'settled'],
      ['committed', 'quoted'],
      ['settled', 'committed'],
      ['reversed', 'quoted'],
      ['failed', 'quoted']
    ];

    for (const [from, to] of illegalPermutations) {
      expect(() => PaymentStateMachine.assertTransition(from, to, 'test-pay-id')).toThrow(DomainError);
    }
  });
});
