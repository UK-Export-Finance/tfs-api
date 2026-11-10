import nock from 'nock';

/**
 * nock@15's type declarations narrow `Scope.filteringRequestBody` to take no arguments, even
 * though the runtime implementation (node_modules/nock/dist/lib/scope.js) still accepts a filter
 * function as documented. A `declare module 'nock'` augmentation cannot fix this because `Scope`
 * is only reachable as `nock.Scope` (a type nested in the default export's merged namespace), not
 * as a top-level named export of the `nock` module, so there is nothing for the augmentation to
 * merge with. Centralising the cast here avoids repeating it at every call site.
 */
export const filterRequestBody = (scope: nock.Scope, filter: (body: string) => string): nock.Scope =>
  (scope.filteringRequestBody as unknown as (filter: (body: string) => string) => nock.Scope)(filter);
