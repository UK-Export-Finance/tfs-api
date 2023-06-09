import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

export type AcbsConfigBaseUrlAndUseReturnExcpetionHeader = Pick<ConfigType<typeof AcbsConfig>, 'baseUrl' | 'useReturnExceptionHeader'>;
