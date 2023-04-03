import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AcbsAuthenticationService } from './acbs-authentication.service';
import { BaseAcbsAuthenticationService, BaseAcbsAuthenticationServiceInjectionKey } from './base-acbs-authentication.service';
import { CachingAcbsAuthenticationService } from './caching-acbs-authentication.service';
import { RetryingAcbsAuthenticationService, RetryingAcbsAuthenticationServiceInjectionKey } from './retrying-acbs-authentication.service';

const acbsAuthenticationServiceProvider = {
  provide: AcbsAuthenticationService,
  useClass: CachingAcbsAuthenticationService,
};

@Module({
  imports: [
    CacheModule.register(),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        maxRedirects: configService.get<number>('acbsAuthentication.maxRedirects'),
        timeout: configService.get<number>('acbsAuthentication.timeout'),
      }),
    }),
  ],
  providers: [
    {
      provide: BaseAcbsAuthenticationServiceInjectionKey,
      useClass: BaseAcbsAuthenticationService,
    },
    {
      provide: RetryingAcbsAuthenticationServiceInjectionKey,
      useClass: RetryingAcbsAuthenticationService,
    },
    acbsAuthenticationServiceProvider,
  ],
  exports: [acbsAuthenticationServiceProvider],
})
export class AcbsAuthenticationModule {}
