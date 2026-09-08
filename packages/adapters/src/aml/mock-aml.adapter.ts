import * as crypto from 'crypto';
import {
  AmlProvider,
  AmlScreeningRequest,
  AmlScreeningResponse
} from '@ledgerbridge/ports';

export class MockAmlAdapter implements AmlProvider {
  public readonly providerName = 'MockAmlProvider (ComplyAdvantage Sim)';

  private sanctionedNames = ['Voldemort', 'Sanctioned Corp', 'Blocked Entity', 'Bad Actor LLC'];
  private pepNames = ['Senator Bob', 'Minister Alice', 'King Arthur'];

  public async screenEntity(request: AmlScreeningRequest): Promise<AmlScreeningResponse> {
    const name = request.name.toLowerCase();

    const isSanctioned = this.sanctionedNames.some(s => name.includes(s.toLowerCase()));
    const isPEP = this.pepNames.some(p => name.includes(p.toLowerCase()));

    if (isSanctioned) {
      return {
        screeningId: crypto.randomUUID(),
        isSanctioned: true,
        isPoliticallyExposed: false,
        hasAdverseMedia: true,
        riskScore: 99,
        matchedLists: ['OFAC-SDN', 'EU-FINANCIAL-SANCTIONS', 'UN-CONSOLIDATED'],
        confidence: 0.99
      };
    }

    if (isPEP) {
      return {
        screeningId: crypto.randomUUID(),
        isSanctioned: false,
        isPoliticallyExposed: true,
        hasAdverseMedia: false,
        riskScore: 65,
        matchedLists: ['GLOBAL-PEP-DATABASE'],
        confidence: 0.92
      };
    }

    return {
      screeningId: crypto.randomUUID(),
      isSanctioned: false,
      isPoliticallyExposed: false,
      hasAdverseMedia: false,
      riskScore: 5,
      matchedLists: [],
      confidence: 0.99
    };
  }
}
