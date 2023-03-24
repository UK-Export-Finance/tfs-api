import { Module } from '@nestjs/common';

import { CurrentDateProvider } from './current-date.provider';

@Module({
  providers: [CurrentDateProvider],
  exports: [CurrentDateProvider],
})
export class DateModule {}
