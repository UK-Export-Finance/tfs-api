import { withEnvironmentVariableParsingUnitTests } from '@ukef-test/common-tests/environment-variable-parsing-unit-tests';

import { MdmConfigType, MdmConfig } from './mdm.config';

describe('mdmConfig', () => {
  const configDirectlyFromEnvironmentVariables: { configPropertyName: keyof MdmConfigType; environmentVariableName: string }[] = [
    {
      configPropertyName: 'baseUrl',
      environmentVariableName: 'APIM_MDM_URL',
    },
    {
      configPropertyName: 'apiKeyHeaderName',
      environmentVariableName: 'APIM_MDM_KEY',
    },
    {
      configPropertyName: 'apiKeyHeaderValue',
      environmentVariableName: 'APIM_MDM_VALUE',
    },
  ];

  const configParsedAsIntFromEnvironmentVariablesWithDefault: {
    configPropertyName: keyof MdmConfigType;
    environmentVariableName: string;
    defaultConfigValue: number;
  }[] = [
    {
      configPropertyName: 'maxRedirects',
      environmentVariableName: 'APIM_MDM_MAX_REDIRECTS',
      defaultConfigValue: 5,
    },
    {
      configPropertyName: 'timeout',
      environmentVariableName: 'APIM_MDM_TIMEOUT',
      defaultConfigValue: 30000,
    },
  ];

  withEnvironmentVariableParsingUnitTests({
    configDirectlyFromEnvironmentVariables,
    configParsedAsIntFromEnvironmentVariablesWithDefault,
    getConfig: () => MdmConfig(),
  });
});
