import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';
import { ExternalServiceConfig } from '@ukef/types';

const KEY = 'mdm';

export { KEY as MDM_CONFIG_KEY };

export type MdmConfigType = ExternalServiceConfig & {
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;
};

export const MdmConfig = registerAs(
  KEY,
  (): MdmConfigType => ({
    baseUrl: process.env.APIM_MDM_URL!,
    apiKeyHeaderName: process.env.APIM_MDM_KEY!,
    apiKeyHeaderValue: process.env.APIM_MDM_VALUE!,
    maxRedirects: getIntConfig(process.env.APIM_MDM_MAX_REDIRECTS, 5),
    timeout: getIntConfig(process.env.APIM_MDM_TIMEOUT, 30000),
  }),
);
