import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import config from '@ukef/config';
import { TfsModule } from '@ukef/modules/tfs.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...config],
    }),
    ThrottlerModule.forRoot({
      limit: 10, // requests
      ttl: 30, // per second
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({
          context: 'HTTP',
        }),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    TfsModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule {}
