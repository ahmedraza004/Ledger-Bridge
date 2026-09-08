import { Money } from '@ledgerbridge/domain';
export interface RegulatoryFilingRequest {
    filingType: 'SAR' | 'CTR' | 'CROSS_BORDER_REPORT';
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
    regulatoryBody: string;
    status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW';
    submissionTimestamp: Date;
    acknowledgementReceiptNumber: string;
}
export interface RegulatoryProvider {
    readonly regulatoryBody: string;
    submitFiling(request: RegulatoryFilingRequest): Promise<RegulatoryFilingResponse>;
}
//# sourceMappingURL=regulatory-provider.port.d.ts.map