import { DomainError, ErrorCode, PaymentState } from '@ledgerbridge/shared';

export const VALID_PAYMENT_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  quoted: ['validated', 'failed'],
  validated: ['committed', 'failed'],
  committed: ['submitted', 'failed'],
  submitted: ['settled', 'failed'],
  settled: ['reversed'],
  reversed: [],
  failed: []
};

export class PaymentStateMachine {
  public static canTransition(from: PaymentState, to: PaymentState): boolean {
    const allowed = VALID_PAYMENT_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  public static assertTransition(from: PaymentState, to: PaymentState, paymentId: string): void {
    if (!this.canTransition(from, to)) {
      throw new DomainError(
        ErrorCode.INVALID_STATE_TRANSITION,
        `Invalid payment state transition from '${from}' to '${to}' for payment ${paymentId}. Allowed targets: [${VALID_PAYMENT_TRANSITIONS[from]?.join(', ') || 'none'}]`
      );
    }
  }
}
