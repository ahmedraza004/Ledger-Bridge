export interface KycVerificationRequest {
  userId: string;
  firstName: string;
  lastName: string;
  dob: string;
  country: string;
  idDocumentType: 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID';
  idDocumentNumber: string;
}

export interface KycVerificationResponse {
  verificationId: string;
  status: 'VERIFIED' | 'UNVERIFIED' | 'REQUIRES_MANUAL_REVIEW' | 'REJECTED';
  riskScore: number; // 0 - 100
  confidence: number;
  checks: {
    idDocumentValid: boolean;
    faceMatch: boolean;
    livenessPassed: boolean;
    pepWatchlistClean: boolean;
  };
  details?: Record<string, unknown>;
}

export interface KycProvider {
  readonly providerName: string;
  verifyIdentity(request: KycVerificationRequest): Promise<KycVerificationResponse>;
  checkStatus(verificationId: string): Promise<KycVerificationResponse>;
}
