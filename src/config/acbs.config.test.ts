import { RandomValueGenerator } from '@ukef-test/support/generator/random-value-generator';
import acbsConfig from './acbs.config';

describe('acbsConfig', () => {
  const valueGenerator = new RandomValueGenerator();

  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  describe('parsing ACBS_USE_RETURN_EXCEPTION_HEADER', () => {
    it('sets useReturnExceptionHeader to true if ACBS_USE_RETURN_EXCEPTION_HEADER is true', () => {
      replaceEnvironmentVariables({
        ACBS_USE_RETURN_EXCEPTION_HEADER: 'true',
      });

      const config = acbsConfig();

      expect(config.useReturnExceptionHeader).toBe(true);
    });

    it('sets useReturnExceptionHeader to false if ACBS_USE_RETURN_EXCEPTION_HEADER is false', () => {
      replaceEnvironmentVariables({
        ACBS_USE_RETURN_EXCEPTION_HEADER: 'false',
      });

      const config = acbsConfig();

      expect(config.useReturnExceptionHeader).toBe(false);
    });

    it('sets useReturnExceptionHeader to false if ACBS_USE_RETURN_EXCEPTION_HEADER is not specified', () => {
      replaceEnvironmentVariables({});

      const config = acbsConfig();

      expect(config.useReturnExceptionHeader).toBe(false);
    });

    it('sets useReturnExceptionHeader to false if ACBS_USE_RETURN_EXCEPTION_HEADER is an empty string', () => {
      replaceEnvironmentVariables({
        ACBS_USE_RETURN_EXCEPTION_HEADER: '',
      });

      const config = acbsConfig();

      expect(config.useReturnExceptionHeader).toBe(false);
    });

    it('sets useReturnExceptionHeader to false if ACBS_USE_RETURN_EXCEPTION_HEADER is any string other than true or false', () => {
      replaceEnvironmentVariables({
        ACBS_USE_RETURN_EXCEPTION_HEADER: valueGenerator.string(),
      });

      const config = acbsConfig();

      expect(config.useReturnExceptionHeader).toBe(false);
    });
  });

  const replaceEnvironmentVariables = (newEnvVariables: Record<string, string>): void => {
    process.env = newEnvVariables;
  };
});
