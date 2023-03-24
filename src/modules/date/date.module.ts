import { Module } from '@nestjs/common';

import { CurrentDateProvider } from './current-date.provider';
import { DateStringTransformations } from './date-string.transformations';

@Module({
  providers: [CurrentDateProvider, DateStringTransformations],
  exports: [CurrentDateProvider, DateStringTransformations],
})
export class DateModule {}
