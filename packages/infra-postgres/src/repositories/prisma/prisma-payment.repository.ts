import { PrismaClient } from '@prisma/client';
import { Payment, PaymentQuote, PaymentState, Money } from '@ledgerbridge/domain';
import { PaymentRepository } from '../interfaces/payment-repository.interface';

export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(payment: Payment): Promise<void> {
    await this.prisma.payment.upsert({
      where: { id: payment.id },
      create: {
        id: payment.id,
        tenantId: payment.tenantId,
        sourceAccountId: payment.sender.accountId,
        destinationAccountId: payment.recipient.accountId,
        sourceAmountMinor: payment.sourceAmount.amountMinor,
        sourceCurrency: payment.sourceAmount.currency,
        targetAmountMinor: payment.targetAmount.amountMinor,
        targetCurrency: payment.targetAmount.currency,
        feeAmountMinor: payment.feeAmount.amountMinor,
        quoteId: payment.quoteId,
        reference: payment.reference,
        state: payment.state as any,
        idempotencyKey: payment.idempotencyKey,
        rejectionReason: payment.rejectionReason,
        ledgerEntryId: payment.ledgerEntryId,
        settlementRailTxId: payment.settlementRailTxId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      },
      update: {
        state: payment.state as any,
        rejectionReason: payment.rejectionReason,
        ledgerEntryId: payment.ledgerEntryId,
        settlementRailTxId: payment.settlementRailTxId,
        updatedAt: payment.updatedAt
      }
    });
  }

  public async findById(id: string): Promise<Payment | null> {
    const raw = await this.prisma.payment.findUnique({
      where: { id },
      include: { sourceAccount: true, destinationAccount: true }
    });
    if (!raw) return null;

    return new Payment({
      id: raw.id,
      tenantId: raw.tenantId,
      sourceAmount: Money.fromMinor(raw.sourceAmountMinor, raw.sourceCurrency),
      targetAmount: Money.fromMinor(raw.targetAmountMinor, raw.targetCurrency),
      feeAmount: Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
      sender: {
        id: raw.sourceAccount.id,
        name: raw.sourceAccount.name,
        country: 'US',
        accountId: raw.sourceAccountId
      },
      recipient: {
        id: raw.destinationAccount.id,
        name: raw.destinationAccount.name,
        country: 'GB',
        accountId: raw.destinationAccountId
      },
      quoteId: raw.quoteId || undefined,
      reference: raw.reference,
      state: raw.state as PaymentState,
      idempotencyKey: raw.idempotencyKey || undefined,
      rejectionReason: raw.rejectionReason || undefined,
      ledgerEntryId: raw.ledgerEntryId || undefined,
      settlementRailTxId: raw.settlementRailTxId || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }

  public async findByIdempotencyKey(key: string): Promise<Payment | null> {
    const raw = await this.prisma.payment.findUnique({
      where: { idempotencyKey: key },
      include: { sourceAccount: true, destinationAccount: true }
    });
    if (!raw) return null;

    return new Payment({
      id: raw.id,
      tenantId: raw.tenantId,
      sourceAmount: Money.fromMinor(raw.sourceAmountMinor, raw.sourceCurrency),
      targetAmount: Money.fromMinor(raw.targetAmountMinor, raw.targetCurrency),
      feeAmount: Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
      sender: {
        id: raw.sourceAccount.id,
        name: raw.sourceAccount.name,
        country: 'US',
        accountId: raw.sourceAccountId
      },
      recipient: {
        id: raw.destinationAccount.id,
        name: raw.destinationAccount.name,
        country: 'GB',
        accountId: raw.destinationAccountId
      },
      quoteId: raw.quoteId || undefined,
      reference: raw.reference,
      state: raw.state as PaymentState,
      idempotencyKey: raw.idempotencyKey || undefined,
      rejectionReason: raw.rejectionReason || undefined,
      ledgerEntryId: raw.ledgerEntryId || undefined,
      settlementRailTxId: raw.settlementRailTxId || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    });
  }

  public async findByTenant(
    tenantId: string,
    options?: { state?: PaymentState; limit?: number; offset?: number }
  ): Promise<Payment[]> {
    const rawList = await this.prisma.payment.findMany({
      where: {
        tenantId,
        ...(options?.state ? { state: options.state as any } : {})
      },
      include: { sourceAccount: true, destinationAccount: true },
      skip: options?.offset ?? 0,
      take: options?.limit ?? 50,
      orderBy: { createdAt: 'desc' }
    });

    return rawList.map(raw => new Payment({
      id: raw.id,
      tenantId: raw.tenantId,
      sourceAmount: Money.fromMinor(raw.sourceAmountMinor, raw.sourceCurrency),
      targetAmount: Money.fromMinor(raw.targetAmountMinor, raw.targetCurrency),
      feeAmount: Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
      sender: {
        id: raw.sourceAccount.id,
        name: raw.sourceAccount.name,
        country: 'US',
        accountId: raw.sourceAccountId
      },
      recipient: {
        id: raw.destinationAccount.id,
        name: raw.destinationAccount.name,
        country: 'GB',
        accountId: raw.destinationAccountId
      },
      quoteId: raw.quoteId || undefined,
      reference: raw.reference,
      state: raw.state as PaymentState,
      idempotencyKey: raw.idempotencyKey || undefined,
      rejectionReason: raw.rejectionReason || undefined,
      ledgerEntryId: raw.ledgerEntryId || undefined,
      settlementRailTxId: raw.settlementRailTxId || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt
    }));
  }

  public async saveQuote(quote: PaymentQuote): Promise<void> {
    await this.prisma.paymentQuote.create({
      data: {
        id: quote.id,
        tenantId: quote.tenantId,
        sourceAmount: quote.sourceAmount.amountMinor,
        sourceCurrency: quote.sourceAmount.currency,
        targetAmount: quote.targetAmount.amountMinor,
        targetCurrency: quote.targetAmount.currency,
        exchangeRate: quote.exchangeRate,
        feeAmountMinor: quote.feeAmount.amountMinor,
        expiresAt: quote.expiresAt,
        createdAt: quote.createdAt
      }
    });
  }

  public async findQuoteById(id: string): Promise<PaymentQuote | null> {
    const raw = await this.prisma.paymentQuote.findUnique({ where: { id } });
    if (!raw) return null;

    return new PaymentQuote({
      id: raw.id,
      tenantId: raw.tenantId,
      sourceAmount: Money.fromMinor(raw.sourceAmount, raw.sourceCurrency),
      targetAmount: Money.fromMinor(raw.targetAmount, raw.targetCurrency),
      targetCurrency: raw.targetCurrency,
      exchangeRate: raw.exchangeRate,
      feeAmount: Money.fromMinor(raw.feeAmountMinor, raw.sourceCurrency),
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt
    });
  }

  public async countByTenant(tenantId: string): Promise<number> {
    return this.prisma.payment.count({ where: { tenantId } });
  }
}
