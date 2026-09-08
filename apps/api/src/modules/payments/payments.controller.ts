import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  UsePipes,
  Headers,
  Query
} from '@nestjs/common';
import { CreatePaymentSchema, CreatePaymentDto, SecurityContext } from '@ledgerbridge/shared';
import { PaymentsService } from './payments.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { OidcAuthGuard } from '../../common/guards/oidc-auth.guard';
import { CurrentUser } from '../../common/decorators/auth-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RbacGuard } from '../../common/guards/rbac.guard';

@Controller('payments')
@UseGuards(OidcAuthGuard, RbacGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles('admin', 'operator', 'customer')
  public async createPayment(
    @Body(new ZodValidationPipe(CreatePaymentSchema)) dto: CreatePaymentDto,
    @CurrentUser() user: SecurityContext
  ) {
    const result = await this.paymentsService.createPayment(dto, user);
    const p = result.payment;

    return {
      id: p.id,
      tenantId: p.tenantId,
      state: p.state,
      sourceAmount: p.sourceAmount.toJSON(),
      sourceAmountFormatted: p.sourceAmount.format(),
      targetAmount: p.targetAmount.toJSON(),
      targetAmountFormatted: p.targetAmount.format(),
      feeAmount: p.feeAmount.toJSON(),
      feeAmountFormatted: p.feeAmount.format(),
      sender: p.sender,
      recipient: p.recipient,
      reference: p.reference,
      rejectionReason: p.rejectionReason,
      ledgerEntryId: p.ledgerEntryId,
      settlementRailTxId: p.settlementRailTxId,
      requiresManualReview: result.requiresManualReview,
      validationReasons: result.validationReasons,
      isCachedIdempotentResponse: result.isCachedIdempotentResponse,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    };
  }

  @Get(':id')
  @Roles('admin', 'operator', 'compliance_officer', 'auditor', 'customer')
  public async getPayment(@Param('id') id: string) {
    const p = await this.paymentsService.getPayment(id);
    if (!p) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return {
      id: p.id,
      tenantId: p.tenantId,
      state: p.state,
      sourceAmount: p.sourceAmount.toJSON(),
      sourceAmountFormatted: p.sourceAmount.format(),
      targetAmount: p.targetAmount.toJSON(),
      targetAmountFormatted: p.targetAmount.format(),
      feeAmount: p.feeAmount.toJSON(),
      feeAmountFormatted: p.feeAmount.format(),
      sender: p.sender,
      recipient: p.recipient,
      reference: p.reference,
      rejectionReason: p.rejectionReason,
      ledgerEntryId: p.ledgerEntryId,
      settlementRailTxId: p.settlementRailTxId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    };
  }

  @Get()
  @Roles('admin', 'operator', 'compliance_officer', 'auditor')
  public async listPayments(@Query('tenantId') tenantId: string = 'default-tenant') {
    const payments = await this.paymentsService.listPayments(tenantId);
    return payments.map(p => ({
      id: p.id,
      tenantId: p.tenantId,
      state: p.state,
      sourceAmount: p.sourceAmount.toJSON(),
      sourceAmountFormatted: p.sourceAmount.format(),
      targetAmount: p.targetAmount.toJSON(),
      targetAmountFormatted: p.targetAmount.format(),
      feeAmount: p.feeAmount.toJSON(),
      feeAmountFormatted: p.feeAmount.format(),
      sender: p.sender,
      recipient: p.recipient,
      reference: p.reference,
      rejectionReason: p.rejectionReason,
      ledgerEntryId: p.ledgerEntryId,
      settlementRailTxId: p.settlementRailTxId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }));
  }
}
