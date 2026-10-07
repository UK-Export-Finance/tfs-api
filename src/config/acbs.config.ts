import './load-dotenv';

import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';
import { ExternalServiceConfig } from '@ukef/types';

export type AcbsConfigType = ExternalServiceConfig & {
  useReturnExceptionHeader: boolean;
};

export const AcbsConfig = registerAs(
  'acbs',
  (): AcbsConfigType => ({
    baseUrl: String(process.env.ACBS_BASE_URL),
    maxRedirects: getIntConfig(process.env.ACBS_MAX_REDIRECTS, 5),
    timeout: getIntConfig(String(process.env.ACBS_TIMEOUT), 30000),
    useReturnExceptionHeader: process.env.ACBS_USE_RETURN_EXCEPTION_HEADER === 'true',
  }),
);
