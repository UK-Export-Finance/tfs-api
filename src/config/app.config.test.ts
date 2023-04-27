import appConfig from './app.config';
import { InvalidConfigException } from './invalid-config.exception';

describe('appConfig', () => {
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  it('throws an InvalidConfigException if LOG_LEVEL is specified but is not a valid log level', () => {
    process.env = {
      LOG_LEVEL: 'not-a-real-log-level',
    };

    const gettingTheAppConfig = () => appConfig();

    expect(gettingTheAppConfig).toThrow(InvalidConfigException);
    expect(gettingTheAppConfig).toThrow(`LOG_LEVEL must be one of fatal,error,warn,info,debug,trace,silent or not specified.`);
  });

  it('uses info as the logLevel if LOG_LEVEL is not specified', () => {
    process.env = {};

    const config = appConfig();

    expect(config.logLevel).toBe('info');
  });

  it('uses info as the logLevel if LOG_LEVEL is empty', () => {
    process.env = {
      LOG_LEVEL: '',
    };

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
    process.env = {
      LOG_LEVEL,
    };

    const config = appConfig();

    expect(config.logLevel).toBe(LOG_LEVEL);
  });
});
