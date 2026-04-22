# tfs-functions

This package contains a minimal Azure Functions app with a storage queue trigger.

The queue trigger is defined in `src/functions/function.ts` and listens on the `gift-requests` queue using the `AzureWebJobsStorage` connection. When a message is received, it calls the `POST /gift/v{version}/facility` endpoint on `tfs-api` to process the facility creation.

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
  --queue-name gift-requests \
  --content "aGVsbG8gd29ybGQ=" \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;QueueEndpoint=http://localhost:10001/devstoreaccount1;"
```

To trigger the poison queue, you can put a message directly on the poison queue:

```bash
az storage message put \
  --queue-name gift-requests-poison \
  --content "aGVsbG8gd29ybGQ=" \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;QueueEndpoint=http://localhost:10001/devstoreaccount1;"
```

## End-to-end local testing (via Docker)

This tests the full flow: `POST /gift/facility/queue` → Azurite queue → function container → `tfs-api` facility creation.

1. In `tfs-api`, set `GIFT_QUEUE_STORAGE_CONNECTION_STRING` to the Azurite connection string:
   ```
   DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;QueueEndpoint=http://localhost:10001/devstoreaccount1;
   ```
2. Start `tfs-api`.
3. Build the functions container:
   ```sh
   npm run docker:build
   ```
4. Start the functions container and Azurite:
   ```sh
   TFS_API_KEY=<your-api-key> npm run docker:start
   ```
   `TFS_API_GIFT_VERSION` defaults to `1` — set it explicitly if your version differs.
5. Run `seed-azurite.sh` to create the `gift-requests` queue.
6. Send a request to the temp queue endpoint on `tfs-api`:
   ```bash
   curl -X POST http://localhost:3001/gift/v1/facility/queue \
     -H "Content-Type: application/json" \
     -H "x-api-key: <your-api-key>" \
     -d '<facility-creation-payload>'
   ```
7. The function container log should show the message was received and the `POST /gift/facility` call was made.

## Queue trigger notes

- The queue binding uses `AzureWebJobsStorage`.
- Messages must be Base64-encoded JSON — the `GiftQueueService` in `tfs-api` handles this automatically when using the `/facility/queue` endpoint.
- On 5 failed processing attempts, the message is moved to `gift-requests-poison` and the poison queue function logs it.
