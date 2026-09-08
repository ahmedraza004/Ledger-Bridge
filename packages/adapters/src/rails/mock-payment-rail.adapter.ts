import * as crypto from 'crypto';
import { Money } from '@ledgerbridge/domain';
import {
  PaymentRailProvider,
  PayoutSubmissionResponse,
  SubmitPayoutRequest
} from '@ledgerbridge/ports';

export class MockPaymentRailAdapter implements PaymentRailProvider {
  public readonly railName = 'MockFasterPaymentsRail';

  public async submitPayout(request: SubmitPayoutRequest): Promise<PayoutSubmissionResponse> {
    const isSimulatedFail = request.recipientName.toLowerCase().includes('failrail');

    if (isSimulatedFail) {
      return {
        railTxId: `rail_err_${crypto.randomUUID().slice(0, 8)}`,
        railName: this.railName,
        status: 'REJECTED',
        feeCharged: Money.zero(request.sourceAmount.currency),
        submittedAt: new Date(),
        estimatedSettlementDate: new Date()
      };
    }

    const feeMinor = (request.sourceAmount.amountMinor * 15n) / 10000n; // 15 bps rail fee
    const feeCharged = Money.fromMinor(feeMinor, request.sourceAmount.currency);

    return {
      railTxId: `rail_tx_${crypto.randomUUID()}`,
      railName: this.railName,
      status: 'SUBMITTED',
      feeCharged,
      submittedAt: new Date(),
      estimatedSettlementDate: new Date(Date.now() + 3600 * 1000) // 1 hour settlement
    };
  }

  public async checkPayoutStatus(railTxId: string): Promise<PayoutSubmissionResponse> {
    return {
      railTxId,
      railName: this.railName,
      status: 'SETTLED',
      feeCharged: Money.fromMinor(50n, 'USD'),
      submittedAt: new Date(Date.now() - 3600 * 1000),
      estimatedSettlementDate: new Date()
    };
  }
}
