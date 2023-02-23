import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

export interface AcbsConfig {
  apiKey: string;
  apiKeyHeaderName: string;

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

    authentication: {
      baseUrl: process.env.ACBS_AUTHENTICATION_BASE_URL,
      clientId: process.env.ACBS_AUTHENTICATION_CLIENT_ID,
      loginName: process.env.ACBS_AUTHENTICATION_LOGIN_NAME,
      password: process.env.ACBS_AUTHENTICATION_PASSWORD,
    },

    maxRedirects: parseInt(process.env.ACBS_MAX_REDIRECTS) || 21,
    timeout: parseInt(process.env.ACBS_TIMEOUT) || 30000,
  }),
);
