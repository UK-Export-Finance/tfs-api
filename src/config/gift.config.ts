import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';
import { ExternalServiceConfig } from '@ukef/types';

export const KEY = 'gift';

export interface GiftConfig extends ExternalServiceConfig {
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;
}

export default registerAs(
  KEY,
  (): GiftConfig => ({
    baseUrl: process.env.GIFT_API_URL,
    apiKeyHeaderName: process.env.GIFT_API_KEY_HEADER_NAME,
    apiKeyHeaderValue: process.env.GIFT_API_KEY,
    maxRedirects: getIntConfig(process.env.GIFT_API_MAX_REDIRECTS, 5),
    timeout: getIntConfig(process.env.GIFT_API_TIMEOUT, 30000),
  }),
);
