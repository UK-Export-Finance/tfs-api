# Trade Finance Services 🚀
TFS micro-service provides endpoints for internal trade finance manager systems responsible for reading and writing to external centralised banking systems:

- ACBS (Advanced Commerical Banking System).
- GIFT (Guarantee, Insurance, & Financing Tracker). Replaces ACBS.

**Status** 🚦

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

**CI** 💫

![Lint](https://github.com/UK-Export-Finance/tfs-api/actions/workflows/lint.yml/badge.svg)
![SCA](https://github.com/UK-Export-Finance/tfs-api/actions/workflows/sca.yml/badge.svg)
![QA](https://github.com/UK-Export-Finance/tfs-api/actions/workflows/test.yml/badge.svg)
![Release](https://github.com/UK-Export-Finance/tfs-api/actions/workflows/publish.yml/badge.svg)

**CD** 🚀

![Release](https://github.com/UK-Export-Finance/tfs-api/actions/workflows/deployment.yml/badge.svg?branch=dev)
![Release](https://github.com/UK-Export-Finance/tfs-api/actions/workflows/deployment.yml/badge.svg?branch=staging)
![Release](https://github.com/UK-Export-Finance/tfs-api/actions/workflows/deployment.yml/badge.svg?branch=production)

## Install 💻

```bash
npm install
```
## Environment Variables 👨🏼‍💻

On first setup you will need to create a `.env ` file in the route of the project, refer to `.env.sample` for the required variables. A member of the team should send an encrypted copy of the `.env` file.

Environment variable tips:

* USE_PINO_PRETTY_LOG_FORMATER - Pino pretty should be enabled just in Dev laptop, as pino-pretty is development
* ACBS_USE_RETURN_EXCEPTION_HEADER - When true an additional request header 'ReturnException' is sent to ACBS. The 'ApiResult' and 'ErrorResult' response headers can be used for debugging.
* ACBS_AUTHENTICATION_ID_TOKEN_CACHE_TTL_IN_MILLISECONDS - A value of 0 will cache the first id token PERMANENTLY but ACBS accepts tokens just for 30 minutes.

## Compilation / Build

### tsconfig.build.json
# TypeScript Configuration ⚙️
This file configures how TypeScript compiles your code.

## Extends 🔱
The `extends` property specifies the path to the base configuration file which is set to `./tsconfig.json`.

## Compiler Options 🔧
The `compilerOptions` property specifies the compiler options.

* `types` specifies the types that should be included in the compilation, `node` in this case.

## Include 📂
The `include` property specifies the files that should be included in the compilation.

## Exclude 🚫
The `exclude` property specifies the files that should be excluded from the compilation.

* `node_modules` excludes the `node_modules` directory.
* `test` excludes the `test` directory and all files that end with `.test.ts`.
* `dist` excludes the `dist` directory.
* `docker-compose*.yml` excludes all files that start with `docker-compose` and end with `.yml`.
* `Dockerfile` excludes the `Dockerfile` file.
* `logs` excludes the `logs` directory.

## Run 💡

How to run `tfs` on local environment as `dev` runtime mode.

```bash
# using docker-compose
$ docker compose up --build
```

```bash
# without docker-compose
$ npm run start:dev
```

To view the Swagger API documentation visit [localhost:{PORT}/docs](http://localhost:3001/docs). You will be prompted for a username & password, these are the Swagger credentials in your `.env`.

To view the API documentation in YAML format visit [localhost:{PORT}/openapi/yaml](http://localhost:3001/openapi/yaml).

Note: `PORT` will default to `3001` if it's not assigned a value in the `.env` file.

## Test 💹

We are running several test suites as part of our CI/CD pipeline.

* Unit test :   These tests are written using Jest and ends with `*.test.ts` extension.
* API test  :   These tests are written using Jest and ends with `*.api-test.ts` extension.
* E2E test  :   These tests are written using Jest and ends with `*.e2e-test.ts` extension.

### NOTE ⚠️
Currently there are **no** E2E tests and none are executed during CI/CD. Once tests have been added please remove `--passWithNoTests` flag from `e2e-tests` scripts, current flags allows Jest to exit with status instead of an error.

```bash
# unit tests
$ npm run unit-test

# api tests
$ npm run api-test

# api tests with nock debugging (very useful if tests are failing)
$ DEBUG=nock.* npm run api-test
```
## Docker 📦
### 1. Dockerfile
Dockerfile is used to build and run a Node.js application in a containerized environment.

#### Stage 1: `Build`
It specifies the base image as `node:19.9-alpine3.16`, which is a minimalistic image of Node.js 19.9 running on Alpine Linux 3.16. The RUN command installs bash and curl packages, then deletes the cache to reduce the image size.

The `WORKDIR` command sets the working directory to `/app`. The `COPY` command copies package.json and package-lock.json to the /app directory, followed by the npm ci command, which installs the dependencies listed in package.json while ensuring compatibility with peer dependencies.
The COPY command copies the rest of the files in the current directory to the /app directory. The `npm run build` command builds the application.
Finally, the npm ci command installs **only** the dependencies listed in `package.json`, ignoring the `devDependencies`, thus reducing the final build image size.


#### Stage 2: `Production`
This section sets up the production stage of the Dockerfile. It specifies the same base image as the build stage. The `WORKDIR` command sets the working directory to `/app`.
The `COPY` command copies package.json, package-lock.json, node_modules/, and dist/ directories only from the build stage to the /app directory (production stage).
Finally, the `USER` command switches the user to the node user, and the CMD command runs the npm `run start:prod` command to start the application in production mode.

#### Conclusion
Overall, the Dockerfile sets up a secure build and deployment environment for the Node.js application, with a non-root user and a lean production image containing only the necessary dependencies and files.

### 2. docker-compose.yml
This is a Docker Compose file used to define and configure the `api` service.

The first section defines the version of the Compose file syntax being used (version `3.8`), and the services that will be run.

Under the api **service**, the following options are specified:

* `build`: specifies the build context for the Docker image. In this case, it is set to the current directory (.), which means that Docker will look for a Dockerfile in the current directory to build the image.
* `image`: specifies the name of the Docker image that will be built.
* `container_name`: specifies the name of the Docker container that will be created from the image.
* `restart`: specifies that the container should always be restarted if it stops running.
* `command`: specifies the command that should be run when the container starts. In this case, it is set to `npm run start:prod`.
* `ports`: specifies the ports that should be exposed by the container. In this case, it is set to ${PORT}:${PORT}, which means that the value of the PORT environment variable will be used for both the host and container ports.
* `volumes`: specifies any directories or files that should be mounted as volumes inside the container. In this case, it is set to `./:/app/src:rw`, which means that the current directory on the host machine will be mounted as a **read-write** volume at `/app/src` inside the container.
* `environment`: specifies any environment variables that should be set inside the container. In this case, a list of environment variables is provided, but their values are not specified in the file since they will be referred from local `.env` file. (Please refer to `.env.sample` for getting started).

The next section defines a **healthcheck** for the container, which will periodically check if the container is running correctly. The options specified are:

* `test`: specifies the command that should be run to test the health of the container. In this case, it is set to `['CMD', 'curl', '-f', 'http://localhost:${PORT}']`, which means that the healthcheck will run the curl command to make a request to the container's web server and check if it receives a response.
* `retries`: specifies the number of times that the healthcheck should be retried before considering the container as unhealthy.
* `interval`: specifies the interval at which the healthcheck should be run.
* `timeout`: specifies the maximum amount of time that the healthcheck command can run before being considered as failed.
* `start_period`: specifies the amount of time to wait before running the first healthcheck after the container has started.

## Code ⌨️
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
This can be achieved by providing a randomised API Key as an environment variable (`API_KEY`) which defines the name of the header passed to the API.

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
