import 'nock';

/**
 * nock@15 narrowed `Scope.filteringRequestBody` to take no arguments, even though the runtime
 * implementation (node_modules/nock/dist/lib/scope.js) still accepts a filter function/RegExp as
 * documented. Restore the documented signature until upstream corrects its type declarations.
 */
declare module 'nock' {
  interface Scope {
    filteringRequestBody(filter: RequestBodyMatcher | ((body: string) => string)): this;
  }
}
