import { setMaxListeners } from 'node:events';

/**
 * nock delegates HTTP/HTTPS interception to `@mswjs/interceptors`, which has several confirmed,
 * currently unresolved upstream bugs where its internal mock sockets leak event listeners
 * (e.g. `close`, `secureConnect`, `secure`, `session`) when the same mocked endpoint is matched
 * many times within a single process. This is exactly what our API test suites do (e.g. GIFT
 * tests register `nock(...).persist()` interceptors in `beforeEach` that get matched across many
 * sequential `it()` cases), which triggers a noisy but harmless `MaxListenersExceededWarning`.
 * See https://github.com/mswjs/interceptors/issues/755, /828 and /859 (open as of writing).
 * Raise the default listener limit so this upstream noise doesn't drown out real CI log output,
 * until a fix lands upstream.
 */
setMaxListeners(50);
