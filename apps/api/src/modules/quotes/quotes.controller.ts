import { Controller, Post, Get, Body, Param, NotFoundException, UseGuards, UsePipes } from '@nestjs/common';
import { CreateQuoteSchema, CreateQuoteDto } from '@ledgerbridge/shared';
import { QuotesService } from './quotes.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OidcAuthGuard } from '../../common/guards/oidc-auth.guard';

@Controller('quotes')
@UseGuards(OidcAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  public async createQuote(@Body(new ZodValidationPipe(CreateQuoteSchema)) dto: CreateQuoteDto) {
    const quote = await this.quotesService.createQuote(dto);
    return {
      id: quote.id,
      tenantId: quote.tenantId,
      sourceAmount: quote.sourceAmount.toJSON(),
      sourceAmountFormatted: quote.sourceAmount.format(),
      targetCurrency: quote.targetCurrency,
      exchangeRate: quote.exchangeRate,
      targetAmount: quote.targetAmount.toJSON(),
      targetAmountFormatted: quote.targetAmount.format(),
      feeAmount: quote.feeAmount.toJSON(),
      feeAmountFormatted: quote.feeAmount.format(),
      expiresAt: quote.expiresAt.toISOString(),
      createdAt: quote.createdAt.toISOString()
    };
  }

  @Get(':id')
  public getQuote(@Param('id') id: string) {
    const quote = this.quotesService.getQuote(id);
    if (!quote) {
      throw new NotFoundException(`Quote ${id} not found`);
    }
    return {
      id: quote.id,
      tenantId: quote.tenantId,
      sourceAmount: quote.sourceAmount.toJSON(),
      sourceAmountFormatted: quote.sourceAmount.format(),
      targetCurrency: quote.targetCurrency,
      exchangeRate: quote.exchangeRate,
      targetAmount: quote.targetAmount.toJSON(),
      targetAmountFormatted: quote.targetAmount.format(),
      feeAmount: quote.feeAmount.toJSON(),
      feeAmountFormatted: quote.feeAmount.format(),
      expiresAt: quote.expiresAt.toISOString(),
      isExpired: quote.isExpired(),
      createdAt: quote.createdAt.toISOString()
    };
  }
}
