import * as crypto from 'crypto';
import {
  KycProvider,
  KycVerificationRequest,
  KycVerificationResponse
} from '@ledgerbridge/ports';

export class MockKycAdapter implements KycProvider {
  public readonly providerName = 'MockKycProvider (Trulioo/Persona Sim)';

  public async verifyIdentity(request: KycVerificationRequest): Promise<KycVerificationResponse> {
    const isFraudSim = request.lastName.toLowerCase().includes('fraud') || request.idDocumentNumber.includes('0000');
    const isManualReviewSim = request.lastName.toLowerCase().includes('review');

    if (isFraudSim) {
      return {
        verificationId: crypto.randomUUID(),
        status: 'REJECTED',
        riskScore: 95,
        confidence: 0.99,
        checks: {
          idDocumentValid: false,
          faceMatch: false,
          livenessPassed: false,
          pepWatchlistClean: false
        }
      };
    }

    if (isManualReviewSim) {
      return {
        verificationId: crypto.randomUUID(),
        status: 'REQUIRES_MANUAL_REVIEW',
        riskScore: 65,
        confidence: 0.75,
        checks: {
          idDocumentValid: true,
          faceMatch: false,
          livenessPassed: true,
          pepWatchlistClean: true
        }
      };
    }

    return {
      verificationId: crypto.randomUUID(),
      status: 'VERIFIED',
      riskScore: 10,
      confidence: 0.98,
      checks: {
        idDocumentValid: true,
        faceMatch: true,
        livenessPassed: true,
        pepWatchlistClean: true
      }
    };
  }

  public async checkStatus(verificationId: string): Promise<KycVerificationResponse> {
    return {
      verificationId,
      status: 'VERIFIED',
      riskScore: 10,
      confidence: 0.98,
      checks: {
        idDocumentValid: true,
        faceMatch: true,
        livenessPassed: true,
        pepWatchlistClean: true
      }
    };
  }
}
