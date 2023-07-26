import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import acbsConfig, { AcbsConfig } from './acbs.config';

describe('acbsConfig', () => {
  let originalProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalProcessEnv = process.env;
  });

  afterEach(() => {
    process.env = originalProcessEnv;
  });

  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof AcbsConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableName: 'ACBS_BASE_URL',
    },
  ];

  const configParsedBooleanFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AcbsConfig;
    environmentVariableName: string;
    defaultConfigValue: boolean;
  }[] = [
    {
      configPropertyName: 'useReturnExceptionHeader',
      environmentVariableName: 'ACBS_USE_RETURN_EXCEPTION_HEADER',
      defaultConfigValue: false,
    },
  ];

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof AcbsConfig;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[] = [
    {
      configPropertyName: 'maxRedirects',
      environmentVariableName: 'ACBS_MAX_REDIRECTS',
      defaultConfigValue: 5,
    },
    {
      configPropertyName: 'timeout',
      environmentVariableName: 'ACBS_TIMEOUT',
      defaultConfigValue: 30000,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configParsedBooleanFromEnvironmentVariablesWithDefault,
    configParsedAsIntFromEnvironmentVariablesWithDefault,
    getConfig: () => acbsConfig(),
  });
});
