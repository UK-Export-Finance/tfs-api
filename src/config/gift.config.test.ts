import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import giftConfig, { GiftConfig } from './gift.config';

describe('giftConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof GiftConfig; environmentVariableName: string }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableName: 'GIFT_API_URL',
    },
    {
      configPropertyName: 'apiKeyHeaderName',
      environmentVariableName: 'GIFT_API_KEY_HEADER_NAME',
    },
    {
      configPropertyName: 'apiKeyHeaderValue',
      environmentVariableName: 'GIFT_API_KEY',
    },
  ];

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof GiftConfig;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[] = [
    {
      configPropertyName: 'maxRedirects',
      environmentVariableName: 'GIFT_API_MAX_REDIRECTS',
      defaultConfigValue: 5,
    },
    {
      configPropertyName: 'timeout',
      environmentVariableName: 'GIFT_API_TIMEOUT',
      defaultConfigValue: 30000,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configParsedAsIntFromEnvironmentVariablesWithDefault,
    getConfig: () => giftConfig(),
  });
});
