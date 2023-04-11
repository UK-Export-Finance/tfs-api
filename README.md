## Installation

```bash
npm install
```

### Running the service (dev)

```bash
# using docker-compose
$ docker compose up --build
```

```bash
# without docker-compose
$ npm run start:dev
```

### Test

We are running several test suites as part of our CI/CD pipeline.

* Unit test :   These tests are written using Jest and ends with `*.test.ts` extension.
* API test  :   These tests are written using Jest and ends with `*.api-test.ts` extension.
* E2E test  :   These tests are written using Cypress and ends with `*.spec.ts` extension. Currently there are *no* E2E tests and none are executed during CI/CD.

```bash
# unit tests
$ npm run unit-test

# api tests
$ npm run api-test

# api tests with nock debugging (very useful if tests are failing)
$ DEBUG=nock.* npm run api-test
```

### Generating new resources

To simplify the generation of new resources, you can use the boilerplate [CRUD](https://docs.nestjs.com/recipes/crud-generator)

```bash
nest g resource users
```

### Writing logs using PinoJS

```bash
# error
this.logger.error({ id: 'your message here' }, 'context-name');

# log
this.logger.log({ id: 'your message here' }, 'context-name');

```

### Authentication
The Trade Finance Services API requires an API Key in order to access its resources.
This can be achieved by providing a randomised API Key as an environment variable (`API_KEY`) and a strategy (`API_KEY_STRATEGY`) which defines the name of the header passed to the API.

### Caching
Currently, only the ID token that is used for authenticating our requests to ACBS is cached.
The lifetime of this cache is controlled by the `ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL_IN_MILLISECONDS` environment variable.
This token has a lifetime of 30 minutes, so it is safe to set this variable to any value between 1 and 180000000.

Do NOT set the variable to 0, as this will cache the ID token permanently.

We do not have a setting to disable this cache, but setting the TTL to 1ms will _essentially_ disable it.

### Writing Conventional Commits

The most important prefixes you should have in mind are:

1. `fix:` which represents bug fixes, and correlates to a [SemVer](https://semver.org/) **patch**.
2. `feat:` which represents a new feature, and correlates to a [SemVer](https://semver.org/) **minor**.
3. `feat!:`, `fix!:` or `refactor!:`, etc., which represent a breaking change (indicated by the `!`) and will result in a [SemVer](https://semver.org/) **major**.