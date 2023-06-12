import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

export type AcbsConfigBaseUrlAndUseReturnExceptionHeader = Pick<ConfigType<typeof AcbsConfig>, 'baseUrl' | 'useReturnExceptionHeader'>;
