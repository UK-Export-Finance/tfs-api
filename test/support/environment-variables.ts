import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

const valueGenerator = new RandomValueGenerator();

export const ENVIRONMENT_VARIABLES = Object.freeze({
  NODE_ENV: 'test',
  LOG_LEVEL: 'debug',
  REDACT_LOGS: false,
  SINGLE_LINE_LOG_FORMAT: true,
  USE_PINO_PRETTY_LOG_FORMATER: false,

  SWAGGER_USER: valueGenerator.string(),
  SWAGGER_PASSWORD: valueGenerator.string(),

  ACBS_AUTHENTICATION_API_KEY: valueGenerator.string(),
  ACBS_AUTHENTICATION_API_KEY_HEADER_NAME: valueGenerator.word(),
  ACBS_AUTHENTICATION_BASE_URL: valueGenerator.httpsUrl(),
  ACBS_AUTHENTICATION_CLIENT_ID: valueGenerator.string(),
  ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL_IN_MILLISECONDS: 500,
  ACBS_AUTHENTICATION_LOGIN_NAME: valueGenerator.string(),
  ACBS_AUTHENTICATION_MAX_REDIRECTS: 0,
  ACBS_AUTHENTICATION_MAX_NUMBER_OF_RETRIES: 1,
  ACBS_AUTHENTICATION_PASSWORD: valueGenerator.string(),
  ACBS_AUTHENTICATION_RETRY_DELAY_IN_MILLISECONDS: 100,
  ACBS_AUTHENTICATION_TIMEOUT: 1000,

  ACBS_BASE_URL: valueGenerator.httpsUrl(),
  ACBS_MAX_REDIRECTS: 0,
  ACBS_TIMEOUT: 1000,
  ACBS_USE_RETURN_EXCEPTION_HEADER: false,

  API_KEY: valueGenerator.string(),

  APIM_MDM_URL: valueGenerator.httpsUrl(),
  APIM_MDM_KEY: valueGenerator.word(),
  APIM_MDM_VALUE: valueGenerator.string(),
  APIM_MDM_MAX_REDIRECTS: 0,
  APIM_MDM_TIMEOUT: 1000,

  GIFT_API_URL: valueGenerator.httpsUrl(),
  GIFT_API_KEY: valueGenerator.string(),
  GIFT_API_MAX_REDIRECTS: 0,
  GIFT_API_TIMEOUT: 1000,
});

export const getEnvironmentVariablesForProcessEnv = (): NodeJS.ProcessEnv => ({
  ...ENVIRONMENT_VARIABLES,
  REDACT_LOGS: ENVIRONMENT_VARIABLES.REDACT_LOGS.toString(),
  SINGLE_LINE_LOG_FORMAT: ENVIRONMENT_VARIABLES.SINGLE_LINE_LOG_FORMAT.toString(),
  USE_PINO_PRETTY_LOG_FORMATER: ENVIRONMENT_VARIABLES.USE_PINO_PRETTY_LOG_FORMATER.toString(),
  ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL_IN_MILLISECONDS: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL_IN_MILLISECONDS.toString(),
  ACBS_AUTHENTICATION_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_MAX_REDIRECTS.toString(),
  ACBS_AUTHENTICATION_MAX_NUMBER_OF_RETRIES: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_MAX_NUMBER_OF_RETRIES.toString(),
  ACBS_AUTHENTICATION_TIMEOUT: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_TIMEOUT.toString(),
  ACBS_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.ACBS_MAX_REDIRECTS.toString(),
  ACBS_AUTHENTICATION_RETRY_DELAY_IN_MILLISECONDS: ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_RETRY_DELAY_IN_MILLISECONDS.toString(),
  ACBS_TIMEOUT: ENVIRONMENT_VARIABLES.ACBS_TIMEOUT.toString(),
  ACBS_USE_RETURN_EXCEPTION_HEADER: ENVIRONMENT_VARIABLES.ACBS_USE_RETURN_EXCEPTION_HEADER.toString(),
  APIM_MDM_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.APIM_MDM_MAX_REDIRECTS.toString(),
  APIM_MDM_TIMEOUT: ENVIRONMENT_VARIABLES.APIM_MDM_TIMEOUT.toString(),
  GIFT_API_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.GIFT_API_MAX_REDIRECTS.toString(),
  GIFT_API_TIMEOUT: ENVIRONMENT_VARIABLES.GIFT_API_TIMEOUT.toString(),
});

const delayToExceedTimeoutOrTtlByInMilliseconds = 1;

export const TIME_EXCEEDING_ACBS_TIMEOUT = ENVIRONMENT_VARIABLES.ACBS_TIMEOUT + delayToExceedTimeoutOrTtlByInMilliseconds;

export const TIME_EXCEEDING_ACBS_AUTHENTICATION_TIMEOUT = ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_TIMEOUT + delayToExceedTimeoutOrTtlByInMilliseconds;

export const TIME_EXCEEDING_ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL =
  ENVIRONMENT_VARIABLES.ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL_IN_MILLISECONDS + delayToExceedTimeoutOrTtlByInMilliseconds;

export const TIME_EXCEEDING_MDM_TIMEOUT = ENVIRONMENT_VARIABLES.APIM_MDM_TIMEOUT + delayToExceedTimeoutOrTtlByInMilliseconds;
