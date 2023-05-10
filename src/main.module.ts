import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '@ukef/config';
import { TfsModule } from '@ukef/modules/tfs.module';
import { LoggerModule } from 'nestjs-pino';

import { LoggerMiddleware } from './logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [...config],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          customProps: () => ({
            context: 'HTTP',
          }),
          level: config.get<string>('app.logLevel'),
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
            },
          },
        },
      }),
    }),
    TfsModule,
  ],
  controllers: [],
  providers: [],
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
