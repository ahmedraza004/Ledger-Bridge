import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TelemetryService } from '../../common/telemetry/telemetry.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [AdminController],
  providers: [AdminService, TelemetryService],
  exports: [AdminService]
})
export class AdminModule {}
