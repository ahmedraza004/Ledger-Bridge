import * as crypto from 'crypto';
import {
  RegulatoryFilingRequest,
  RegulatoryFilingResponse,
  RegulatoryProvider
} from '@ledgerbridge/ports';

export class MockRegulatoryAdapter implements RegulatoryProvider {
  public readonly regulatoryBody: string;

  constructor(regulatoryBody: string = 'FinCEN-SAR-Portal') {
    this.regulatoryBody = regulatoryBody;
  }

  public async submitFiling(request: RegulatoryFilingRequest): Promise<RegulatoryFilingResponse> {
    const filingReference = `SAR-${request.tenantId.slice(0, 4)}-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const acknowledgementReceiptNumber = `ACK-FINCEN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    return {
      filingReference,
      regulatoryBody: this.regulatoryBody,
      status: 'ACKNOWLEDGED',
      submissionTimestamp: new Date(),
      acknowledgementReceiptNumber
    };
  }
}
