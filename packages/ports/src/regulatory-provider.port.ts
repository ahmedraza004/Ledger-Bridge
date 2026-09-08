import { Money } from '@ledgerbridge/domain';

export interface RegulatoryFilingRequest {
  filingType: 'SAR' | 'CTR' | 'CROSS_BORDER_REPORT'; // Suspicious Activity Report / Currency Transaction Report
  tenantId: string;
  paymentId: string;
  subjectName: string;
  subjectId: string;
  amount: Money;
  suspicionNarrative: string;
  indicators: string[];
}

export interface RegulatoryFilingResponse {
  filingReference: string;
  regulatoryBody: string; // e.g., FinCEN, FCA, SAMA
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW';
  submissionTimestamp: Date;
  acknowledgementReceiptNumber: string;
}

export interface RegulatoryProvider {
  readonly regulatoryBody: string;
  submitFiling(request: RegulatoryFilingRequest): Promise<RegulatoryFilingResponse>;
}
