import { HEADERS } from '@ukef/constants';
import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import { GiftConfigType, GiftConfig } from './gift.config';

describe('giftConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof GiftConfigType; environmentVariableName: string }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableName: 'GIFT_API_URL',
    },
    {
      configPropertyName: 'apiKeyHeaderValue',
      environmentVariableName: 'GIFT_API_KEY',
    },
  ];

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof GiftConfigType;
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
    getConfig: () => GiftConfig(),
  });

  it('should have an apiKeyHeaderName defined', () => {
    expect(GiftConfig().apiKeyHeaderName).toBe(HEADERS.X_API_KEY);
  });
});
