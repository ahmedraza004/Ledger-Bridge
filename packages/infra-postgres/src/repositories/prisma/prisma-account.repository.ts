import { PrismaClient } from '@prisma/client';
import { Account } from '@ledgerbridge/domain';
import { AccountRepository } from '../interfaces/account-repository.interface';

export class PrismaAccountRepository implements AccountRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(account: Account): Promise<void> {
    await this.prisma.account.upsert({
      where: { id: account.id },
      create: {
        id: account.id,
        tenantId: account.tenantId,
        name: account.name,
        currency: account.currency,
        type: account.type as any,
        status: account.status as any,
        kycTier: account.kycTier,
        metadata: account.metadata as any
      },
      update: {
        name: account.name,
        status: account.status as any,
        kycTier: account.kycTier,
        metadata: account.metadata as any
      }
    });
  }

  public async findById(id: string): Promise<Account | null> {
    const raw = await this.prisma.account.findUnique({ where: { id } });
    if (!raw) return null;

    return new Account({
      id: raw.id,
      tenantId: raw.tenantId,
      name: raw.name,
      currency: raw.currency,
      type: raw.type as any,
      status: raw.status as any,
      kycTier: raw.kycTier,
      metadata: (raw.metadata as Record<string, unknown>) || {},
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }

  public async findByTenant(tenantId: string): Promise<Account[]> {
    const list = await this.prisma.account.findMany({ where: { tenantId } });
    return list.map(raw => new Account({
      id: raw.id,
      tenantId: raw.tenantId,
      name: raw.name,
      currency: raw.currency,
      type: raw.type as any,
      status: raw.status as any,
      kycTier: raw.kycTier,
      metadata: (raw.metadata as Record<string, unknown>) || {},
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }));
  }
}
