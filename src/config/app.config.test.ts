import { APPLICATION } from '@ukef/constants';
import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import { AppConfig, AppConfigType } from './app.config';
import { InvalidConfigException } from './invalid-config.exception';

const { VERSION_PREFIX } = APPLICATION;

const replaceEnvironmentVariables = (newEnvVariables: Record<string, string>): void => {
  process.env = newEnvVariables;
};

describe('AppConfig', () => {
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('logLevel', () => {
    describe('when LOG_LEVEL is not specified', () => {
      it('should return `logLevel` as `info`', () => {
        // Arrange
        replaceEnvironmentVariables({
          LOG_LEVEL: undefined!,
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.logLevel).toBe('info');
      });
    });

    describe('when LOG_LEVEL is empty', () => {
      it('should return `logLevel` as `info`', () => {
        // Arrange
        replaceEnvironmentVariables({
          LOG_LEVEL: '',
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.logLevel).toBe('info');
      });
    });

    describe('when LOG_LEVEL is specified, but is not a valid log level', () => {
      it('should throw an InvalidConfigException', () => {
        // Arrange
        const mockLogLevel = 'not-a-real-log-level';

        replaceEnvironmentVariables({
          LOG_LEVEL: mockLogLevel,
        });

        const gettingTheAppConfig = () => AppConfig();

        // Act & Assert
        expect(gettingTheAppConfig).toThrow(InvalidConfigException);

        expect(gettingTheAppConfig).toThrow(`LOG_LEVEL must be one of fatal,error,warn,info,debug,trace,silent or not specified. Received ${mockLogLevel}`);
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
      // Arrange
      replaceEnvironmentVariables({
        LOG_LEVEL,
      });

      const config = AppConfig();

      // Act & Assert
      expect(config.logLevel).toBe(LOG_LEVEL);
    });
  });

  describe('versioning', () => {
    it('should return an object with default properties', () => {
      // Arrange
      const mockHttpVersion = undefined!;

      replaceEnvironmentVariables({
        HTTP_VERSIONING_ENABLE: undefined!,
        HTTP_VERSION: mockHttpVersion,
      });

      // Act
      const config = AppConfig();

      // Assert
      const expected = {
        enable: false,
        prefix: VERSION_PREFIX,
        prefixAndVersion: `${VERSION_PREFIX}1`,
        version: '1',
      };

      expect(config.versioning).toEqual(expected);
    });

    describe('when HTTP_VERSIONING_ENABLE is specified', () => {
      it('should return `enable` as true', () => {
        // Arrange
        replaceEnvironmentVariables({
          HTTP_VERSIONING_ENABLE: 'true',
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.versioning.enable).toBe(true);
      });
    });

    describe('when HTTP_VERSION is an empty string', () => {
      it('should return `version` as the default `1`', () => {
        // Arrange
        replaceEnvironmentVariables({
          HTTP_VERSION: '',
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.versioning.version).toBe('1');
      });

      it('should return `prefixAndVersion` using the default version `1`', () => {
        // Arrange
        replaceEnvironmentVariables({
          HTTP_VERSION: '',
        });

        // Act
        const config = AppConfig();

        // Assert
        const expected = `${VERSION_PREFIX}1`;

        expect(config.versioning.prefixAndVersion).toBe(expected);
      });
    });

    describe('when HTTP_VERSION is specified', () => {
      const mockHttpVersion = '100200';

      it('should return `version` with the provided HTTP_VERSION', () => {
        // Arrange
        replaceEnvironmentVariables({
          HTTP_VERSION: mockHttpVersion,
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.versioning.version).toBe(mockHttpVersion);
      });

      it('should return `prefixAndVersion` with the provided HTTP_VERSION', () => {
        // Arrange
        replaceEnvironmentVariables({
          HTTP_VERSION: mockHttpVersion,
        });

        // Act
        const config = AppConfig();

        // Assert
        const expected = `${VERSION_PREFIX}${mockHttpVersion}`;

        expect(config.versioning.prefixAndVersion).toBe(expected);
      });
    });
  });

  describe('giftVersioning', () => {
    it('should return an object', () => {
      // Arrange
      const mockHttpVersion = '100200';

      replaceEnvironmentVariables({
        GIFT_HTTP_VERSION: mockHttpVersion,
      });

      // Act
      const config = AppConfig();

      // Assert
      const expected = {
        enable: false,
        prefix: VERSION_PREFIX,
        prefixAndVersion: `${VERSION_PREFIX}${mockHttpVersion}`,
        version: mockHttpVersion,
      };

      expect(config.giftVersioning).toEqual(expected);
    });
  });

  describe('giftFeatureEnabled', () => {
    describe('when FF_GIFT_ENABLED is not set or false', () => {
      it('should return giftFeatureEnabled as false', () => {
        // Arrange
        replaceEnvironmentVariables({
          FF_GIFT_ENABLED: undefined!,
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.giftFeatureEnabled).toBe(false);
      });
    });

    describe('when FF_GIFT_ENABLED is set to true', () => {
      it('should return giftFeatureEnabled as true', () => {
        // Arrange
        replaceEnvironmentVariables({
          FF_GIFT_ENABLED: 'true',
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.giftFeatureEnabled).toBe(true);
      });
    });

    describe('when FF_GIFT_ENABLED is set to any value other than "true"', () => {
      it('should return giftFeatureEnabled as false', () => {
        // Arrange
        replaceEnvironmentVariables({
          FF_GIFT_ENABLED: 'false',
        });

        // Act
        const config = AppConfig();

        // Assert
        expect(config.giftFeatureEnabled).toBe(false);
      });
    });
  });

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AppConfigType;
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
    configPropertyName: keyof AppConfigType;
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
    getConfig: () => AppConfig(),
  });
});
