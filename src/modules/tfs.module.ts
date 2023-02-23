import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/module/acbs/acbs.module';

@Module({
  imports: [AcbsModule],
  exports: [AcbsModule],
})
export class TfsModule {}
