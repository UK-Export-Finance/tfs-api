# tfs-functions

This package contains a minimal Azure Functions app with a storage queue trigger.

The current trigger is defined in `src/functions/function.ts` and listens on the placeholder `js-queue-items` queue using the `AzureWebJobsStorage` connection.

## Prerequisites

- Node.js 22 or later
- npm
- Docker Desktop for local container builds
- Azure Functions Core Tools 
- Azure CLI

## Run the host locally (without Docker)

1. Copy `local.settings.json.sample` to `local.settings.json`.
2. Install dependencies with `npm ci`.
3. Start Azurite, using the VS Code Azurite extension.
4. Start the Functions host with `npm start`.

The host will build the TypeScript source before startup.

## Running via a container in Docker

Run these commands from this directory.

To build the container:

```sh
npm run docker:build
```

To start the container locally, together with Azurite:

```sh
npm run docker:start
```

The Functions host will be available on `http://localhost:7071`.

## Testing the queue

After building the container, run the `seed-azurite.sh` script; this will create the queue.
After that, you can post a message onto the queue. This needs to be Base64 encoded. The example below is the Base64 encoded message for hello world.

```bash
az storage message put \
  --queue-name js-queue-items \
  --content "aGVsbG8gd29ybGQ=" \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;QueueEndpoint=http://localhost:10001/devstoreaccount1;"
```

## Queue trigger notes

- The image is configured for a storage queue trigger.
- The queue binding uses `AzureWebJobsStorage`.
- No external queue is wired up yet.
