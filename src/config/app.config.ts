import './load-dotenv';

import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';

import { InvalidConfigException } from './invalid-config.exception';
import { APPLICATION } from '@ukef/constants';

const {
  API_KEY,
  NODE_ENV,
  APP_NAME,
  HTTP_PORT,
  HTTP_VERSION,
  HTTP_VERSIONING_ENABLE,
  LOG_LEVEL,
  REDACT_LOGS,
  SINGLE_LINE_LOG_FORMAT,
  USE_PINO_PRETTY_LOG_FORMATER,
} = process.env;

const validLogLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];

export interface AppConfig {
  apiKey: string;
  env: string;
  giftVersioning: {
    enable: boolean;
    prefix: string;
    version: string;
    prefixAndVersion: string;
  };
  globalPrefix: string;
  logLevel: string;
  name: string;
  port: number;
  redactLogs: boolean;
  singleLineLogFormat: boolean;
  usePinoPrettyLogFormatter: boolean;
  versioning: {
    enable: boolean;
    prefix: string;
    version: string;
  };
}

export default registerAs('app', (): Record<string, any> => {
  const logLevel = LOG_LEVEL || 'info';

  if (!validLogLevels.includes(logLevel)) {
    throw new InvalidConfigException(`LOG_LEVEL must be one of ${validLogLevels} or not specified.`);
  }

  const versionPrefix = APPLICATION.VERSION_PREFIX;
  const version = HTTP_VERSION || '1';

  /**
   * APIM TFS versioning for ACBS endpoints
   */
  const acbsVersioning = {
    enable: HTTP_VERSIONING_ENABLE === 'true',
    prefix: versionPrefix,
    version,
  };

  /**
   * APIM TFS versioning for GIFT endpoints
   * NOTE: This is versioning for our APIM TFS GIFT endpoints,
   * as opposed to the external GIFT API endpoints.
   */

  const giftVersion = `${Number(version) + 1}`

  const giftVersioning = {
    prefix: versionPrefix,
    prefixAndVersion: `${versionPrefix}${giftVersion}`,
    version: giftVersion,
  };

  return {
    apiKey: API_KEY,
    env: NODE_ENV || 'development',
    giftVersioning,
    globalPrefix: '/api',
    logLevel: LOG_LEVEL || 'info',
    name: APP_NAME || 'tfs',
    port: getIntConfig(HTTP_PORT, 3001),
    redactLogs: REDACT_LOGS !== 'false',
    singleLineLogFormat: SINGLE_LINE_LOG_FORMAT !== 'false',
    usePinoPrettyLogFormatter: USE_PINO_PRETTY_LOG_FORMATER === 'true',
    versioning: acbsVersioning,
  };
});
