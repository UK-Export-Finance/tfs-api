import './load-dotenv';

import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';

import { InvalidConfigException } from './invalid-config.exception';

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
  const logLevel = process.env.LOG_LEVEL || 'info';

  if (!validLogLevels.includes(logLevel)) {
    throw new InvalidConfigException(`LOG_LEVEL must be one of ${validLogLevels} or not specified.`);
  }

  const versionPrefix = 'v';
  const version = process.env.HTTP_VERSION || '1';

  const enableVersioning = process.env.HTTP_VERSIONING_ENABLE === 'true';

  /**
   * APIM TFS versioning for ACBS endpoints
   */
  const acbsVersioning = {
    enable: enableVersioning,
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
    enable: enableVersioning,
    prefix: versionPrefix,
    prefixAndVersion: `${versionPrefix}${giftVersion}`,
    version: giftVersion,
  };

  return {
    apiKey: process.env.API_KEY,
    env: process.env.NODE_ENV || 'development',
    giftVersioning,
    globalPrefix: '/api',
    logLevel: process.env.LOG_LEVEL || 'info',
    name: process.env.APP_NAME || 'tfs',
    port: getIntConfig(process.env.HTTP_PORT, 3001),
    redactLogs: process.env.REDACT_LOGS !== 'false',
    singleLineLogFormat: process.env.SINGLE_LINE_LOG_FORMAT !== 'false',
    usePinoPrettyLogFormatter: process.env.USE_PINO_PRETTY_LOG_FORMATER === 'true',
    versioning: acbsVersioning,
  };
});
