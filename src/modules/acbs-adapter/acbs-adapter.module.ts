import { Module } from '@nestjs/common';
import { AcbsModule } from '@ukef/modules/acbs/acbs.module';

import { AcbsExceptionTransformInterceptor } from './acbs-exception-transform.interceptor';

@Module({
  imports: [AcbsModule],
  providers: [AcbsExceptionTransformInterceptor],
  exports: [AcbsExceptionTransformInterceptor],
})
export class AcbsAdapterModule {}
