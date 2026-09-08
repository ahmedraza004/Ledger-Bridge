"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaLedgerRepository = void 0;
const domain_1 = require("@ledgerbridge/domain");
class PrismaLedgerRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async saveAccount(account) {
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
    async findAccountById(id) {
        const raw = await this.prisma.ledgerAccount.findUnique({ where: { id } });
        if (!raw)
            return null;
        return new domain_1.LedgerAccount({
            id: raw.id,
            tenantId: raw.tenantId,
            name: raw.name,
            type: raw.type,
            currency: raw.currency,
            status: raw.status,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }
    async findAccountsByTenant(tenantId) {
        const list = await this.prisma.ledgerAccount.findMany({ where: { tenantId } });
        return list.map(raw => new domain_1.LedgerAccount({
            id: raw.id,
            tenantId: raw.tenantId,
            name: raw.name,
            type: raw.type,
            currency: raw.currency,
            status: raw.status,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        }));
    }
    async saveEntry(entry) {
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
    async findEntryById(id) {
        const raw = await this.prisma.ledgerEntry.findUnique({
            where: { id },
            include: { postings: true }
        });
        if (!raw)
            return null;
        const postings = raw.postings.map(p => new domain_1.Posting({
            id: p.id,
            ledgerEntryId: p.ledgerEntryId,
            accountId: p.accountId,
            amount: domain_1.Money.fromMinor(p.amountMinor, p.currency),
            direction: p.direction,
            sequence: p.sequence
        }));
        return new domain_1.LedgerEntry({
            id: raw.id,
            tenantId: raw.tenantId,
            transactionDate: raw.transactionDate,
            description: raw.description,
            correlationId: raw.correlationId || undefined,
            status: raw.status,
            postings,
            createdAt: raw.createdAt
        });
    }
    async findEntriesByTenant(tenantId) {
        const list = await this.prisma.ledgerEntry.findMany({
            where: { tenantId },
            include: { postings: true },
            orderBy: { createdAt: 'desc' }
        });
        return list.map(raw => {
            const postings = raw.postings.map(p => new domain_1.Posting({
                id: p.id,
                ledgerEntryId: p.ledgerEntryId,
                accountId: p.accountId,
                amount: domain_1.Money.fromMinor(p.amountMinor, p.currency),
                direction: p.direction,
                sequence: p.sequence
            }));
            return new domain_1.LedgerEntry({
                id: raw.id,
                tenantId: raw.tenantId,
                transactionDate: raw.transactionDate,
                description: raw.description,
                correlationId: raw.correlationId || undefined,
                status: raw.status,
                postings,
                createdAt: raw.createdAt
            });
        });
    }
    async findPostingsForAccount(accountId) {
        const raw = await this.prisma.posting.findMany({ where: { accountId } });
        return raw.map(p => new domain_1.Posting({
            id: p.id,
            ledgerEntryId: p.ledgerEntryId,
            accountId: p.accountId,
            amount: domain_1.Money.fromMinor(p.amountMinor, p.currency),
            direction: p.direction,
            sequence: p.sequence
        }));
    }
    async getAccountBalance(accountId) {
        const account = await this.findAccountById(accountId);
        if (!account)
            return null;
        const postings = await this.findPostingsForAccount(accountId);
        return domain_1.DoubleEntryLedger.calculateAccountBalance(account, postings);
    }
}
exports.PrismaLedgerRepository = PrismaLedgerRepository;
//# sourceMappingURL=prisma-ledger.repository.js.map