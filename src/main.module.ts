import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from '@ukef/config';
import { TfsModule } from '@ukef/module/tfs.module';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...config],
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
