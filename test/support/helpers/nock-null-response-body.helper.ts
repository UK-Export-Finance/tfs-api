import { Body } from 'nock';

/**
 * nock's `Body` type does not include `null`, even though a literal `null` JSON
 * response body is a real scenario we need to simulate (e.g. ACBS returning
 * `200 null`). Centralising the cast here avoids repeating `null!` at every call site.
 */
export const NOCK_NULL_RESPONSE_BODY = null as unknown as Body;
