export interface AmlScreeningRequest {
  entityId: string;
  name: string;
  dateOfBirth?: string;
  country: string;
  nationalId?: string;
  isCompany?: boolean;
}

export interface AmlScreeningResponse {
  screeningId: string;
  isSanctioned: boolean;
  isPoliticallyExposed: boolean;
  hasAdverseMedia: boolean;
  riskScore: number; // 0 - 100
  matchedLists: string[];
  confidence: number;
}

export interface AmlProvider {
  readonly providerName: string;
  screenEntity(request: AmlScreeningRequest): Promise<AmlScreeningResponse>;
}
