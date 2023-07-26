import './load-dotenv';

import { registerAs } from '@nestjs/config';
import { getIntConfig } from '@ukef/helpers/get-int-config';

export interface AcbsConfig {
  baseUrl: string;
  maxRedirects: number;
  timeout: number;
  useReturnExceptionHeader: boolean;
}

export default registerAs(
  'acbs',
  (): AcbsConfig => ({
    baseUrl: process.env.ACBS_BASE_URL,
    maxRedirects: getIntConfig(process.env.ACBS_MAX_REDIRECTS, 5),
    timeout: getIntConfig(process.env.ACBS_TIMEOUT, 30000),
    useReturnExceptionHeader: process.env.ACBS_USE_RETURN_EXCEPTION_HEADER === 'true',
  }),
);
