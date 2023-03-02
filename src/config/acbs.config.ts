import './load-dotenv';

import { registerAs } from '@nestjs/config';

export interface AcbsConfig {
  apiKey: string;
  apiKeyHeaderName: string;
  baseUrl: string;

  authentication: {
    baseUrl: string;
    clientId: string;
    loginName: string;
    password: string;
  };

  maxRedirects: number;
  timeout: number;
}

export default registerAs(
  'acbs',
  (): AcbsConfig => ({
    apiKey: process.env.ACBS_API_KEY,
    apiKeyHeaderName: process.env.ACBS_API_KEY_HEADER_NAME,
    baseUrl: process.env.ACBS_BASE_URL,

    authentication: {
      baseUrl: process.env.ACBS_AUTHENTICATION_BASE_URL,
      clientId: process.env.ACBS_AUTHENTICATION_CLIENT_ID,
      loginName: process.env.ACBS_AUTHENTICATION_LOGIN_NAME,
      password: process.env.ACBS_AUTHENTICATION_PASSWORD,
    },

    maxRedirects: parseInt(process.env.ACBS_MAX_REDIRECTS) || 5,
    timeout: parseInt(process.env.ACBS_TIMEOUT) || 30000,
  }),
);
