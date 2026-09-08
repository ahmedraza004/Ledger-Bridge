export interface CompanyVerificationRequest {
    companyName: string;
    registrationNumber: string;
    jurisdiction: string;
    taxId?: string;
}
export interface CompanyVerificationResponse {
    verificationId: string;
    isValid: boolean;
    status: 'ACTIVE' | 'DISSOLVED' | 'SUSPENDED' | 'NOT_FOUND';
    legalForm: string;
    incorporationDate: string;
    registeredAddress: string;
    directors: string[];
    beneficialOwners: string[];
}
export interface CompanyVerificationProvider {
    readonly providerName: string;
    verifyCompany(request: CompanyVerificationRequest): Promise<CompanyVerificationResponse>;
}
//# sourceMappingURL=company-verification-provider.port.d.ts.map