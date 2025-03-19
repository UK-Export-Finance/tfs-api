import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import appConfig, { AppConfig } from './app.config';
import { InvalidConfigException } from './invalid-config.exception';

describe('appConfig', () => {
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('logLevel', () => {
    describe('when LOG_LEVEL is specified, but is not a valid log level', () => {
      it('should throw an InvalidConfigException', () => {
        replaceEnvironmentVariables({
          LOG_LEVEL: 'not-a-real-log-level',
        });

        const gettingTheAppConfig = () => appConfig();

        expect(gettingTheAppConfig).toThrow(InvalidConfigException);

        expect(gettingTheAppConfig).toThrow(`LOG_LEVEL must be one of fatal,error,warn,info,debug,trace,silent or not specified.`);
      });
    });

    describe('when LOG_LEVEL is not specified', () => {
      it('should return `logLevel` as `info`', () => {
        replaceEnvironmentVariables({
          LOG_LEVEL: undefined,
        });

        const config = appConfig();

        expect(config.logLevel).toBe('info');
      });
    });

    describe('when LOG_LEVEL is empty', () => {
      it('should return `logLevel` as `info`', () => {
        replaceEnvironmentVariables({
          LOG_LEVEL: '',
        });

        const config = appConfig();

        expect(config.logLevel).toBe('info');
      });
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

  describe('versioning', () => {
    it('should return an object with default properties', () => {
      replaceEnvironmentVariables({
        HTTP_VERSIONING_ENABLE: undefined,
        HTTP_VERSION: undefined,
      });

      const config = appConfig();

      const expected = {
        enable: false,
        prefix: 'v',
        version: '2',
      };

      expect(config.versioning).toEqual(expected);
    });

    describe('when HTTP_VERSIONING_ENABLE is specified', () => {
      it('should return `enable` as true', () => {
        replaceEnvironmentVariables({
          HTTP_VERSIONING_ENABLE: 'true',
        });

        const config = appConfig();

        expect(config.versioning.enable).toBe(true);
      });
    });

    describe('when HTTP_VERSION is specified', () => {
      it('should return `version` as HTTP_VERSION', () => {
        const mockVersion = '100200';

        replaceEnvironmentVariables({
          HTTP_VERSION: mockVersion,
        });

        const config = appConfig();

        expect(config.versioning.version).toBe(mockVersion);
      });
    });
  });

  const replaceEnvironmentVariables = (newEnvVariables: Record<string, string>): void => {
    process.env = newEnvVariables;
  };

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfig;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[] = [
    {
      configPropertyName: 'port',
      environmentVariableName: 'HTTP_PORT',
      defaultConfigValue: 3001,
    },
  ];

  const configParsedBooleanFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfig;
    environmentVariableName: string;
    defaultConfigValue: boolean;
  }[] = [
    { configPropertyName: 'redactLogs', environmentVariableName: 'REDACT_LOGS', defaultConfigValue: true },
    { configPropertyName: 'singleLineLogFormat', environmentVariableName: 'SINGLE_LINE_LOG_FORMAT', defaultConfigValue: true },
    { configPropertyName: 'usePinoPrettyLogFormatter', environmentVariableName: 'USE_PINO_PRETTY_LOG_FORMATER', defaultConfigValue: false },
  ];

  withEnvironmentVariableParsingUnitTests({
    configParsedBooleanFromEnvironmentVariablesWithDefault,
    configParsedAsIntFromEnvironmentVariablesWithDefault,
    getConfig: () => appConfig(),
  });
});
