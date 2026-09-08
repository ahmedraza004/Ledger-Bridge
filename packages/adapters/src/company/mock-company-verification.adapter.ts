import * as crypto from 'crypto';
import {
  CompanyVerificationProvider,
  CompanyVerificationRequest,
  CompanyVerificationResponse
} from '@ledgerbridge/ports';

export class MockCompanyVerificationAdapter implements CompanyVerificationProvider {
  public readonly providerName = 'MockCompanyRegistry (CompaniesHouse Sim)';

  public async verifyCompany(request: CompanyVerificationRequest): Promise<CompanyVerificationResponse> {
    const isDissolved = request.companyName.toLowerCase().includes('dissolved');

    if (isDissolved) {
      return {
        verificationId: crypto.randomUUID(),
        isValid: false,
        status: 'DISSOLVED',
        legalForm: 'Limited Liability Company',
        incorporationDate: '2015-06-12',
        registeredAddress: '100 Old Street, London, UK',
        directors: ['John Doe'],
        beneficialOwners: ['John Doe (100%)']
      };
    }

    return {
      verificationId: crypto.randomUUID(),
      isValid: true,
      status: 'ACTIVE',
      legalForm: 'Private Limited Company (Ltd)',
      incorporationDate: '2020-01-15',
      registeredAddress: '1 Financial Square, New York, NY 10005',
      directors: ['Jane Smith (CEO)', 'Alex Mercer (CFO)'],
      beneficialOwners: ['Jane Smith (60%)', 'Apex Ventures (40%)']
    };
  }
}
