import { registerAs } from '@nestjs/config';

export const KEY = 'mdm';

export interface MdmConfig {
  baseUrl: string;
  apiKeyHeaderName: string;
  apiKeyHeaderValue: string;
  maxRedirects: number;
  timeout: number;
}

export default registerAs(
  KEY,
  (): MdmConfig => ({
    baseUrl: process.env.APIM_MDM_URL,
    apiKeyHeaderName: process.env.APIM_MDM_KEY,
    apiKeyHeaderValue: process.env.APIM_MDM_VALUE,
    maxRedirects: parseInt(process.env.APIM_MDM_MAX_REDIRECTS) || 5,
    timeout: parseInt(process.env.APIM_MDM_TIMEOUT) || 30000,
  }),
);
