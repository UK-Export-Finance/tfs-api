import './load-dotenv';

import { registerAs } from '@nestjs/config';

export interface AcbsConfig {
  baseUrl: string;
  maxRedirects: number;
  timeout: number;
}

export default registerAs(
  'acbs',
  (): AcbsConfig => ({
    baseUrl: process.env.ACBS_BASE_URL,
    maxRedirects: parseInt(process.env.ACBS_MAX_REDIRECTS) || 5,
    timeout: parseInt(process.env.ACBS_TIMEOUT) || 30000,
  }),
);
