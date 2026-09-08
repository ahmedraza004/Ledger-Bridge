import { setup, createActor } from 'xstate';
import { PaymentState } from '@ledgerbridge/shared';

export interface PaymentMachineContext {
  paymentId: string;
  tenantId: string;
  rejectionReason?: string;
}

export type PaymentMachineEvent =
  | { type: 'VALIDATE' }
  | { type: 'COMMIT' }
  | { type: 'SUBMIT' }
  | { type: 'SETTLE' }
  | { type: 'REVERSE'; reason: string }
  | { type: 'FAIL'; reason: string };

export const paymentMachine = setup({
  types: {
    context: {} as PaymentMachineContext,
    events: {} as PaymentMachineEvent
  },
  actions: {
    recordFailure: ({ context, event }) => {
      if ('reason' in event) {
        context.rejectionReason = event.reason;
      }
    }
  }
}).createMachine({
  id: 'paymentStateMachine',
  initial: 'quoted',
  context: {
    paymentId: '',
    tenantId: ''
  },
  states: {
    quoted: {
      on: {
        VALIDATE: 'validated',
        FAIL: {
          target: 'failed',
          actions: 'recordFailure'
        }
      }
    },
    validated: {
      on: {
        COMMIT: 'committed',
        FAIL: {
          target: 'failed',
          actions: 'recordFailure'
        }
      }
    },
    committed: {
      on: {
        SUBMIT: 'submitted',
        FAIL: {
          target: 'failed',
          actions: 'recordFailure'
        }
      }
    },
    submitted: {
      on: {
        SETTLE: 'settled',
        FAIL: {
          target: 'failed',
          actions: 'recordFailure'
        }
      }
    },
    settled: {
      on: {
        REVERSE: {
          target: 'reversed',
          actions: 'recordFailure'
        }
      }
    },
    reversed: {
      type: 'final'
    },
    failed: {
      type: 'final'
    }
  }
});

export class XStatePaymentWorkflow {
  public static createActor(initialState: PaymentState = 'quoted', context: PaymentMachineContext) {
    const actor = createActor(paymentMachine, {
      snapshot: paymentMachine.resolveState({
        value: initialState,
        context
      })
    });
    actor.start();
    return actor;
  }
}
