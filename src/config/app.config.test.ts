import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';

import appConfig from './app.config';
import { InvalidConfigException } from './invalid-config.exception';

describe('appConfig', () => {
  const valueGenerator = new RandomValueGenerator();

  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('parsing LOG_LEVEL', () => {
    it('throws an InvalidConfigException if LOG_LEVEL is specified but is not a valid log level', () => {
      replaceEnvironmentVariables({
        LOG_LEVEL: 'not-a-real-log-level',
      });

      const gettingTheAppConfig = () => appConfig();

      expect(gettingTheAppConfig).toThrow(InvalidConfigException);
      expect(gettingTheAppConfig).toThrow(`LOG_LEVEL must be one of fatal,error,warn,info,debug,trace,silent or not specified.`);
    });

    it('uses info as the logLevel if LOG_LEVEL is not specified', () => {
      replaceEnvironmentVariables({});

      const config = appConfig();

      expect(config.logLevel).toBe('info');
    });

    it('uses info as the logLevel if LOG_LEVEL is empty', () => {
      replaceEnvironmentVariables({
        LOG_LEVEL: '',
      });

      const config = appConfig();

      expect(config.logLevel).toBe('info');
    });

    it.each([
      {
        LOG_LEVEL: 'fatal',
      },
      {
        LOG_LEVEL: 'error',
      },
      {
        LOG_LEVEL: 'warn',
      },
      {
        LOG_LEVEL: 'info',
      },
      {
        LOG_LEVEL: 'debug',
      },
      {
        LOG_LEVEL: 'trace',
      },
      {
        LOG_LEVEL: 'silent',
      },
    ])('uses LOG_LEVEL as the logLevel if LOG_LEVEL is valid ($LOG_LEVEL)', ({ LOG_LEVEL }) => {
      replaceEnvironmentVariables({
        LOG_LEVEL,
      });

      const config = appConfig();

      expect(config.logLevel).toBe(LOG_LEVEL);
    });
  });

  describe('parsing REDACT_SENSITIVE_DATA_IN_LOGS', () => {
    it('sets redactSensitiveDataInLogs to true if REDACT_SENSITIVE_DATA_IN_LOGS is true', () => {
      replaceEnvironmentVariables({
        REDACT_SENSITIVE_DATA_IN_LOGS: 'true',
      });

      const config = appConfig();

      expect(config.redactSensitiveDataInLogs).toBe(true);
    });

    it('sets redactSensitiveDataInLogs to false if REDACT_SENSITIVE_DATA_IN_LOGS is false', () => {
      replaceEnvironmentVariables({
        REDACT_SENSITIVE_DATA_IN_LOGS: 'false',
      });

      const config = appConfig();

      expect(config.redactSensitiveDataInLogs).toBe(false);
    });

    it('sets redactSensitiveDataInLogs to true if REDACT_SENSITIVE_DATA_IN_LOGS is not specified', () => {
      replaceEnvironmentVariables({});

      const config = appConfig();

      expect(config.redactSensitiveDataInLogs).toBe(true);
    });

    it('sets redactSensitiveDataInLogs to true if REDACT_SENSITIVE_DATA_IN_LOGS is the empty string', () => {
      replaceEnvironmentVariables({
        REDACT_SENSITIVE_DATA_IN_LOGS: '',
      });

      const config = appConfig();

      expect(config.redactSensitiveDataInLogs).toBe(true);
    });

    it('sets redactSensitiveDataInLogs to true if REDACT_SENSITIVE_DATA_IN_LOGS is any string other than true or false', () => {
      replaceEnvironmentVariables({
        REDACT_SENSITIVE_DATA_IN_LOGS: valueGenerator.string(),
      });

      const config = appConfig();

      expect(config.redactSensitiveDataInLogs).toBe(true);
    });
  });

  const replaceEnvironmentVariables = (newEnvVariables: Record<string, string>): void => {
    process.env = newEnvVariables;
  };
});
