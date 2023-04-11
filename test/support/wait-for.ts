import { waitFor } from '@ukef/helpers/wait-for.helper';

import { TIME_EXCEEDING_ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL } from './environment-variables';

export const waitForAcbsAuthenticationIdTokenCacheToExpire = (): Promise<void> => waitFor(TIME_EXCEEDING_ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL);
