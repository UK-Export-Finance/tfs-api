import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

const valueGenerator = new RandomValueGenerator();

export const ENVIRONMENT_VARIABLES = Object.freeze({
  APP_ENV: 'test',

  SWAGGER_USER: valueGenerator.string(),
  SWAGGER_PASSWORD: valueGenerator.string(),

  ACBS_API_KEY: valueGenerator.string(),
  ACBS_API_KEY_HEADER_NAME: valueGenerator.word(),
  ACBS_BASE_URL: valueGenerator.httpsUrl(),
  ACBS_AUTHENTICATION_BASE_URL: valueGenerator.httpsUrl(),
  ACBS_AUTHENTICATION_CLIENT_ID: valueGenerator.string(),
  ACBS_AUTHENTICATION_LOGIN_NAME: valueGenerator.string(),
  ACBS_AUTHENTICATION_PASSWORD: valueGenerator.string(),
  ACBS_MAX_REDIRECTS: 0,
  ACBS_TIMEOUT: 1000,
});

export const getEnvironmentVariablesForProcessEnv = (): NodeJS.ProcessEnv => ({
  ...ENVIRONMENT_VARIABLES,
  ACBS_MAX_REDIRECTS: ENVIRONMENT_VARIABLES.ACBS_MAX_REDIRECTS.toString(),
  ACBS_TIMEOUT: ENVIRONMENT_VARIABLES.ACBS_TIMEOUT.toString(),
});
