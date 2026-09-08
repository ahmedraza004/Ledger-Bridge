import { XStatePaymentWorkflow } from '../src/state-machine/xstate-payment.machine';

describe('XState Payment State Machine Engine', () => {
  it('should transition through full state machine lifecycle', () => {
    const actor = XStatePaymentWorkflow.createActor('quoted', {
      paymentId: 'pay-xstate-1',
      tenantId: 'tenant-1'
    });

    expect(actor.getSnapshot().value).toBe('quoted');

    actor.send({ type: 'VALIDATE' });
    expect(actor.getSnapshot().value).toBe('validated');

    actor.send({ type: 'COMMIT' });
    expect(actor.getSnapshot().value).toBe('committed');

    actor.send({ type: 'SUBMIT' });
    expect(actor.getSnapshot().value).toBe('submitted');

    actor.send({ type: 'SETTLE' });
    expect(actor.getSnapshot().value).toBe('settled');

    actor.send({ type: 'REVERSE', reason: 'Fraudulent transaction' });
    expect(actor.getSnapshot().value).toBe('reversed');
  });

  it('should transition to failed with failure reason recorded', () => {
    const actor = XStatePaymentWorkflow.createActor('validated', {
      paymentId: 'pay-xstate-2',
      tenantId: 'tenant-1'
    });

    actor.send({ type: 'FAIL', reason: 'Rail timeout' });
    expect(actor.getSnapshot().value).toBe('failed');
    expect(actor.getSnapshot().context.rejectionReason).toBe('Rail timeout');
  });
});
