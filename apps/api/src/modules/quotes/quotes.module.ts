import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { TelemetryService } from '../../common/telemetry/telemetry.service';

@Module({
  controllers: [QuotesController],
  providers: [QuotesService, TelemetryService],
  exports: [QuotesService]
})
export class QuotesModule {}
