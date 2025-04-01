import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import appConfig, { AppConfig } from './app.config';
import { InvalidConfigException } from './invalid-config.exception';
import { APPLICATION } from '@ukef/constants';

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
        prefix: APPLICATION.VERSION_PREFIX,
        version: '1',
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
        const mockHttpVersion = '100200';

        replaceEnvironmentVariables({
          HTTP_VERSION: mockHttpVersion,
        });

        const config = appConfig();

        expect(config.versioning.version).toBe(mockHttpVersion);
      });
    });
  });

  describe('giftVersioning', () => {
    it('should return an object with default properties', () => {
      replaceEnvironmentVariables({
        HTTP_VERSION: undefined,
      });

      const config = appConfig();

      const expected = {
        prefix: APPLICATION.VERSION_PREFIX,
        prefixAndVersion: 'v2',
        version: '2',
      };

      expect(config.giftVersioning).toEqual(expected);
    });

    describe('when HTTP_VERSION is specified', () => {
      it('should return `version` as an incremented HTTP_VERSION', () => {
        const mockHttpVersion = '100200';

        replaceEnvironmentVariables({
          HTTP_VERSION: mockHttpVersion,
        });

        const config = appConfig();

        const expected = '100201';

        expect(config.giftVersioning.version).toBe(expected);
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
