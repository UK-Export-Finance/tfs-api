import { waitFor } from '@ukef/helpers/wait-for.helper';

import { TIME_EXCEEDING_ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL } from './environment-variables';

// TODO APIM-97: should we use fake timers instead?
// TODO APIM-97: should all tests wait for cache to expire?
export const waitForAcbsAuthenticationIdTokenCacheToExpire = (): Promise<void> => waitFor(TIME_EXCEEDING_ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL);
