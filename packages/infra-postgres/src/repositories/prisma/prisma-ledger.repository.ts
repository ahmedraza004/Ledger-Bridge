import { PrismaClient } from '@prisma/client';
import {
  LedgerAccount,
  LedgerEntry,
  Posting,
  AccountBalance,
  Money,
  DoubleEntryLedger
} from '@ledgerbridge/domain';
import { LedgerRepository } from '../interfaces/ledger-repository.interface';

export class PrismaLedgerRepository implements LedgerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async saveAccount(account: LedgerAccount): Promise<void> {
    await this.prisma.ledgerAccount.upsert({
      where: { id: account.id },
      create: {
        id: account.id,
        tenantId: account.tenantId,
        name: account.name,
        type: account.type,
        currency: account.currency,
        status: account.status
      },
      update: {
        name: account.name,
        status: account.status
      }
    });
  }

  public async findAccountById(id: string): Promise<LedgerAccount | null> {
    const raw = await this.prisma.ledgerAccount.findUnique({ where: { id } });
    if (!raw) return null;
    return new LedgerAccount({
      id: raw.id,
      tenantId: raw.tenantId,
      name: raw.name,
      type: raw.type as any,
      currency: raw.currency,
      status: raw.status as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }

  public async findAccountsByTenant(tenantId: string): Promise<LedgerAccount[]> {
    const list = await this.prisma.ledgerAccount.findMany({ where: { tenantId } });
    return list.map(raw => new LedgerAccount({
      id: raw.id,
      tenantId: raw.tenantId,
      name: raw.name,
      type: raw.type as any,
      currency: raw.currency,
      status: raw.status as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }));
  }

  public async saveEntry(entry: LedgerEntry): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.ledgerEntry.create({
        data: {
          id: entry.id,
          tenantId: entry.tenantId,
          transactionDate: entry.transactionDate,
          description: entry.description,
          correlationId: entry.correlationId,
          status: entry.status,
          postings: {
            create: entry.postings.map(p => ({
              id: p.id,
              accountId: p.accountId,
              amountMinor: p.amount.amountMinor,
              currency: p.amount.currency,
              direction: p.direction,
              sequence: p.sequence
            }))
          }
        }
      });
    });
  }

  public async findEntryById(id: string): Promise<LedgerEntry | null> {
    const raw = await this.prisma.ledgerEntry.findUnique({
      where: { id },
      include: { postings: true }
    });
    if (!raw) return null;

    const postings = raw.postings.map(p => new Posting({
      id: p.id,
      ledgerEntryId: p.ledgerEntryId,
      accountId: p.accountId,
      amount: Money.fromMinor(p.amountMinor, p.currency),
      direction: p.direction as any,
      sequence: p.sequence
    }));

    return new LedgerEntry({
      id: raw.id,
      tenantId: raw.tenantId,
      transactionDate: raw.transactionDate,
      description: raw.description,
      correlationId: raw.correlationId || undefined,
      status: raw.status as any,
      postings,
      createdAt: raw.createdAt
    });
  }

  public async findEntriesByTenant(tenantId: string): Promise<LedgerEntry[]> {
    const list = await this.prisma.ledgerEntry.findMany({
      where: { tenantId },
      include: { postings: true },
      orderBy: { createdAt: 'desc' }
    });

    return list.map(raw => {
      const postings = raw.postings.map(p => new Posting({
        id: p.id,
        ledgerEntryId: p.ledgerEntryId,
        accountId: p.accountId,
        amount: Money.fromMinor(p.amountMinor, p.currency),
        direction: p.direction as any,
        sequence: p.sequence
      }));

      return new LedgerEntry({
        id: raw.id,
        tenantId: raw.tenantId,
        transactionDate: raw.transactionDate,
        description: raw.description,
        correlationId: raw.correlationId || undefined,
        status: raw.status as any,
        postings,
        createdAt: raw.createdAt
      });
    });
  }

  public async findPostingsForAccount(accountId: string): Promise<Posting[]> {
    const raw = await this.prisma.posting.findMany({ where: { accountId } });
    return raw.map(p => new Posting({
      id: p.id,
      ledgerEntryId: p.ledgerEntryId,
      accountId: p.accountId,
      amount: Money.fromMinor(p.amountMinor, p.currency),
      direction: p.direction as any,
      sequence: p.sequence
    }));
  }

  public async getAccountBalance(accountId: string): Promise<AccountBalance | null> {
    const account = await this.findAccountById(accountId);
    if (!account) return null;
    const postings = await this.findPostingsForAccount(accountId);
    return DoubleEntryLedger.calculateAccountBalance(account, postings);
  }
}
