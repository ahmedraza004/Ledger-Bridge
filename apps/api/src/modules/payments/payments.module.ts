import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { TelemetryService } from '../../common/telemetry/telemetry.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, TelemetryService],
  exports: [PaymentsService]
})
export class PaymentsModule {}
