import { ConfigType } from '@nestjs/config';
import AcbsConfig from '@ukef/config/acbs.config';

export type AcbsConfigBaseUrl = Pick<ConfigType<typeof AcbsConfig>, 'baseUrl'>;
