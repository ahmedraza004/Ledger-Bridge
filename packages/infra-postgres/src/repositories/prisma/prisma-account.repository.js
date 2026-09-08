"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAccountRepository = void 0;
const domain_1 = require("@ledgerbridge/domain");
class PrismaAccountRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(account) {
        await this.prisma.account.upsert({
            where: { id: account.id },
            create: {
                id: account.id,
                tenantId: account.tenantId,
                name: account.name,
                currency: account.currency,
                type: account.type,
                status: account.status,
                kycTier: account.kycTier,
                metadata: account.metadata
            },
            update: {
                name: account.name,
                status: account.status,
                kycTier: account.kycTier,
                metadata: account.metadata
            }
        });
    }
    async findById(id) {
        const raw = await this.prisma.account.findUnique({ where: { id } });
        if (!raw)
            return null;
        return new domain_1.Account({
            id: raw.id,
            tenantId: raw.tenantId,
            name: raw.name,
            currency: raw.currency,
            type: raw.type,
            status: raw.status,
            kycTier: raw.kycTier,
            metadata: raw.metadata || {},
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        });
    }
    async findByTenant(tenantId) {
        const list = await this.prisma.account.findMany({ where: { tenantId } });
        return list.map(raw => new domain_1.Account({
            id: raw.id,
            tenantId: raw.tenantId,
            name: raw.name,
            currency: raw.currency,
            type: raw.type,
            status: raw.status,
            kycTier: raw.kycTier,
            metadata: raw.metadata || {},
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        }));
    }
}
exports.PrismaAccountRepository = PrismaAccountRepository;
//# sourceMappingURL=prisma-account.repository.js.map