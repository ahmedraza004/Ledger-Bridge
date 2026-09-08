import { PaymentStateMachine } from '../src/payments/state-machine';
import { Payment } from '../src/payments/payment';
import { Money } from '../src/money/money';
import { DomainError, ErrorCode } from '@ledgerbridge/shared';

describe('Payment State Machine Transitions', () => {
  const mockPaymentProps = {
    id: 'pay-sm-1',
    tenantId: 'tenant-1',
    sourceAmount: Money.fromMinor(10000n, 'USD'),
    targetAmount: Money.fromMinor(10000n, 'USD'),
    feeAmount: Money.fromMinor(20n, 'USD'),
    sender: { id: 's1', name: 'Alice', country: 'US', accountId: 'acc-s1' },
    recipient: { id: 'r1', name: 'Bob', country: 'US', accountId: 'acc-r1' },
    reference: 'REF-123'
  };

  it('should follow canonical happy path: quoted -> validated -> committed -> submitted -> settled', () => {
    const payment = new Payment(mockPaymentProps);
    expect(payment.state).toBe('quoted');

    payment.transitionTo('validated');
    expect(payment.state).toBe('validated');

    payment.transitionTo('committed');
    expect(payment.state).toBe('committed');

    payment.transitionTo('submitted');
    expect(payment.state).toBe('submitted');

    payment.transitionTo('settled');
    expect(payment.state).toBe('settled');
  });

  it('should allow settlement reversal: settled -> reversed', () => {
    const payment = new Payment(mockPaymentProps);
    payment.transitionTo('validated');
    payment.transitionTo('committed');
    payment.transitionTo('submitted');
    payment.transitionTo('settled');

    payment.transitionTo('reversed', 'Customer dispute chargeback');
    expect(payment.state).toBe('reversed');
    expect(payment.rejectionReason).toBe('Customer dispute chargeback');
  });

  it('should allow transition to failed from validated/committed/submitted', () => {
    const p1 = new Payment(mockPaymentProps);
    p1.transitionTo('validated');
    p1.transitionTo('failed', 'Rule violation');
    expect(p1.state).toBe('failed');

    const p2 = new Payment(mockPaymentProps);
    p2.transitionTo('validated');
    p2.transitionTo('committed');
    p2.transitionTo('failed', 'Insufficient ledger balance');
    expect(p2.state).toBe('failed');
  });

  it('should REJECT illegal transitions (e.g. quoted -> settled or reversed -> settled)', () => {
    const payment = new Payment(mockPaymentProps);

    expect(() => payment.transitionTo('settled')).toThrow(DomainError);
    expect(() => payment.transitionTo('settled')).toThrow(
      expect.objectContaining({ code: ErrorCode.INVALID_STATE_TRANSITION })
    );

    payment.transitionTo('validated');
    payment.transitionTo('committed');
    payment.transitionTo('submitted');
    payment.transitionTo('settled');
    payment.transitionTo('reversed');

    expect(() => payment.transitionTo('settled')).toThrow(DomainError);
  });
});
