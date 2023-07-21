import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import config from '@ukef/config';
import { BODY_LOG_KEY, HEADERS_LOG_KEY, INCOMING_RESPONSE_LOG_KEY, OUTGOING_REQUEST_LOG_KEY } from '@ukef/modules/http/http.constants';
import { TfsModule } from '@ukef/modules/tfs.module';
import { LoggerModule } from 'nestjs-pino';

import { logKeysToRedact } from './logging/log-keys-to-redact';
import { LoggingInterceptor } from './logging/logging-interceptor.helper';
import {
  SENSITIVE_REQUEST_FIELD_NAMES,
  SENSITIVE_RESPONSE_FIELD_NAMES,
  SENSITIVE_RESPONSE_HEADER_NAMES,
} from './modules/acbs-authentication/acbs-authentication.constants';

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
              singleLine: config.get<string>('app.singleLineLogFormat'),
            },
          },
          redact: logKeysToRedact({
            redactLogs: config.get<boolean>('app.redactLogs'),
            clientRequest: {
              logKey: 'req',
              headersLogKey: 'headers',
            },
            outgoingRequest: {
              logKey: OUTGOING_REQUEST_LOG_KEY,
              headersLogKey: HEADERS_LOG_KEY,
              bodyLogKey: BODY_LOG_KEY,
              sensitiveBodyFields: SENSITIVE_REQUEST_FIELD_NAMES,
            },
            incomingResponse: {
              logKey: INCOMING_RESPONSE_LOG_KEY,
              headersLogKey: HEADERS_LOG_KEY,
              sensitiveHeaders: SENSITIVE_RESPONSE_HEADER_NAMES,
              bodyLogKey: BODY_LOG_KEY,
              sensitiveBodyFields: SENSITIVE_RESPONSE_FIELD_NAMES,
            },
            error: {
              logKey: 'err',
              sensitiveChildKeys: [
                // The `config` key is sensitive if the error is an AxiosError as it contains the request body
                // as a JSON string, and so can contain any secret request field. For example, it can contain
                // our secret authentication credentials if the error occurs during the authentication process
                // with FIS IdP.
                'config',
              ],
            },
          }),
        },
      }),
    }),
    TfsModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class MainModule {}
