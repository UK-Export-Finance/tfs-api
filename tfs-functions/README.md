# tfs-functions

This package contains a minimal Azure Functions app with a storage queue trigger.

The current trigger is defined in `src/functions/function.ts` and listens on the `js-queue-items` queue using the `AzureWebJobsStorage` connection.

## Prerequisites

- Node.js 22 or later
- npm
- Docker Desktop for local container builds
- Azure Functions Core Tools for running the host outside Docker

## Run the host locally

1. Copy `local.settings.json.sample` to `local.settings.json`.
2. Install dependencies with `npm ci`.
3. Start Azurite.
   - Either use the VS Code Azurite extension, or run `docker compose -f docker-compose.local.yml up azurite -d`.
4. Start the Functions host with `npm start`.

The host will build the TypeScript source before startup.

## Build the container locally

Run the following from this directory:

```sh
npm run docker:build
```

## Start the container locally

To run the Functions container together with Azurite:

```sh
npm run docker:start
```

The Functions host will be available on `http://localhost:7071`.

## Queue trigger notes

- The image is configured for a storage queue trigger.
- The queue binding uses `AzureWebJobsStorage`.
- No external queue is wired up yet.
