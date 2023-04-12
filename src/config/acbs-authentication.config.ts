import { registerAs } from '@nestjs/config';

export interface AcbsAuthenticationConfig {
  apiKey: string;
  apiKeyHeaderName: string;
  baseUrl: string;
  clientId: string;
  idTokenCacheTtlInMilliseconds: number;
  loginName: string;
  maxNumberOfRetries: number;
  maxRedirects: number;
  password: string;
  retryDelayInMilliseconds: number;
  timeout: number;
}

export default registerAs(
  'acbsAuthentication',
  (): AcbsAuthenticationConfig => ({
    apiKey: process.env.ACBS_AUTHENTICATION_API_KEY,
    apiKeyHeaderName: process.env.ACBS_AUTHENTICATION_API_KEY_HEADER_NAME,
    baseUrl: process.env.ACBS_AUTHENTICATION_BASE_URL,
    clientId: process.env.ACBS_AUTHENTICATION_CLIENT_ID,
    idTokenCacheTtlInMilliseconds: parseInt(process.env.ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL_IN_MILLISECONDS) || 60000,
    loginName: process.env.ACBS_AUTHENTICATION_LOGIN_NAME,
    maxRedirects: parseInt(process.env.ACBS_AUTHENTICATION_MAX_REDIRECTS) || 5,
    maxNumberOfRetries: parseInt(process.env.ACBS_AUTHENTICATION_MAX_NUMBER_OF_RETRIES) || 1,
    password: process.env.ACBS_AUTHENTICATION_PASSWORD,
    retryDelayInMilliseconds: parseInt(process.env.ACBS_AUTHENTICATION_RETRY_DELAY_IN_MILLISECONDS) || 500,
    timeout: parseInt(process.env.ACBS_AUTHENTICATION_TIMEOUT) || 30000,
  }),
);
