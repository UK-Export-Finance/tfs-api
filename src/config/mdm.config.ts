import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';
import { ExternalServiceConfig } from '@ukef/types';

export const KEY = 'mdm';

export interface MdmConfig extends ExternalServiceConfig {
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;
}

export default registerAs(
  KEY,
  (): MdmConfig => ({
    baseUrl: process.env.APIM_MDM_URL,
    apiKeyHeaderName: process.env.APIM_MDM_KEY,
    apiKeyHeaderValue: process.env.APIM_MDM_VALUE,
    maxRedirects: getIntConfig(process.env.APIM_MDM_MAX_REDIRECTS, 5),
    timeout: getIntConfig(process.env.APIM_MDM_TIMEOUT, 30000),
  }),
);
