import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PaymentsModule } from './modules/payments/payments.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { LedgerModule } from './modules/ledger/ledger.module';
import { AuditModule } from './modules/audit/audit.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AdminModule } from './modules/admin/admin.module';
import { TelemetryService } from './common/telemetry/telemetry.service';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 120
    }]),
    PaymentsModule,
    QuotesModule,
    AccountsModule,
    LedgerModule,
    AuditModule,
    ComplianceModule,
    AdminModule
  ],
  providers: [TelemetryService]
})
export class AppModule {}
