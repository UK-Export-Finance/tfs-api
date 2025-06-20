/**
 * Explicit list of consumers that are allowed to integrate with APIM TFS GIFT endpoints.
 * In the future ServiceNames could become e.g:
 * type ServiceNames = typeof DTFS | typeof SERVICE_B | typeof SERVICE_C;
 */
const DTFS = 'DTFS' as const;

type ServiceNames = typeof DTFS;

export const CONSUMER = {
  DTFS,
} as const satisfies Record<string, ServiceNames>;
