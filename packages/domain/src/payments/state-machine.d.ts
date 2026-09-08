import { PaymentState } from '@ledgerbridge/shared';
export declare const VALID_PAYMENT_TRANSITIONS: Record<PaymentState, PaymentState[]>;
export declare class PaymentStateMachine {
    static canTransition(from: PaymentState, to: PaymentState): boolean;
    static assertTransition(from: PaymentState, to: PaymentState, paymentId: string): void;
}
//# sourceMappingURL=state-machine.d.ts.map