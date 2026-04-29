# tfs-functions

This package contains a minimal Azure Functions app with a storage queue trigger.

The main queue trigger is defined in `src/functions/process-queue-item.ts` and listens on the
`gift-requests` queue using the `AzureWebJobsStorage` connection. When a message is received, the
function calls the `/api/v2/gift/facility` endpoint on `tfs-api` to process the facility creation.

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

This tests the full flow: `POST /gift/facility/queue` → Azurite queue → function container → `tfs-api` -> GIFT facility creation.

1. In `tfs-api`, ensure `GIFT_QUEUE_STORAGE_CONNECTION_STRING` is set in your `.env` — the value is pre-populated in `.env.sample`.
2. Start `tfs-api`.
3. Start running GIFT locally, ensuring `GIFT_API_URL` in tfs-api `.env` is correct.
4. Build the functions container:

   ```sh
   npm run docker:build
   ```

5. Copy `.env.sample` to `.env` and fill in the values:

   ```sh
   cp .env.sample .env
   ```

   - `TFS_API_KEY` — must match the `API_KEY` env var set in `tfs-api`
6. Start the functions container and Azurite:

   ```sh
   npm run docker:start
   ```

7. Run `seed-azurite.sh` to create the `gift-requests` queue.
8. Send a request to the POST `gift/facility/queue` endpoint using swagger.
9. The function container log should show the message was received and the `POST /gift/facility` call was made.

## Queue trigger notes

- The queue binding uses `AzureWebJobsStorage`.
- Messages must be Base64-encoded JSON — the `GiftQueueService` in `tfs-api` handles this automatically when using the `/facility/queue` endpoint.
- After 5 failed attempts, the message is moved to `gift-requests-poison` and the poison queue function logs it.

## Azure deployment

### Architecture

The full request flow on Azure is:

```
APIM → tfs-api (Container App) → Azure Storage Queue → tfs-functions (Container App) → GIFT API
```

All components run inside a single **Container Apps Environment** (`cae-apim-<env>-<version>`), deployed into a private VNet subnet. The storage account sits behind a **private endpoint** so queue traffic never leaves the VNet.

### Resources

| Resource | Name pattern | Purpose |
|---|---|---|
| Container Apps Environment | `cae-apim-<env>-<version>` | Shared environment for both container apps |
| Container App — tfs-api | `ca-apim-tfs-<env>-<version>` | Hosts the tfs-api HTTP service, ingress external via APIM |
| Container App — tfs-functions | `ca-apim-functions-<env>-<version>` | Hosts this functions app, ingress internal only |
| Storage account | `stapimfn<env><version>` | Holds the `gift-requests` queue and Functions runtime state |
| Storage queue | `gift-requests` | Queue bridging tfs-api and tfs-functions |
| Managed identity — tfs-api | `id-apim-tfs-<env>-<version>` | Identity used by the tfs-api container app |
| Managed identity — tfs-functions | `id-apim-functions-<env>-<version>` | Identity used by the tfs-functions container app |
| Private endpoint | `pep-apim-<env>-<version>-st-queue` | Privately exposes the queue storage endpoint inside the VNet |
| Private DNS zone | `privatelink.queue.core.windows.net` | Resolves the storage account to the private IP inside the VNet |

### Identity and RBAC

Each container app has its own managed identity with the minimum required permissions:

| Identity | Role | Scope | Purpose |
|---|---|---|---|
| `id-apim-tfs-*` | Storage Queue Data Contributor | Storage account | Allows tfs-api to enqueue messages |
| `id-apim-functions-*` | Storage Queue Data Message Processor | Storage account | Allows tfs-functions to dequeue and complete messages |
| Both | AcrPull | Container registry | Allows both apps to pull images from ACR |

### Authentication to the storage queue

Both container apps authenticate to the storage account using **managed identity** — no connection strings or storage keys are used. The tfs-functions container app is configured with:

```
AzureWebJobsStorage__accountName = stapimfn<env><version>
AzureWebJobsStorage__credential  = managedidentity
AzureWebJobsStorage__clientId    = <client ID of id-apim-functions-*>
```

The `__accountName` / `__credential` / `__clientId` convention is the Azure Functions v4 passwordless storage binding format. The Functions runtime uses this to acquire tokens via the managed identity rather than a connection string.

### Infrastructure provisioning

All of the above is provisioned by `.github/workflows/infrastructure.yml` in the root of this repository. The relevant steps are:

- **Storage account** — `az storage account create` acts as create-or-update; re-running applies the parameters to the existing account
- **Storage queue** — idempotent `az storage queue create`
- **Storage queue role assignments** — checks for existing assignments before creating, to avoid duplicates
- **Storage private endpoint** — creates subnet, private endpoint, DNS zone, VNet link, and DNS zone group; all steps are guarded with existence checks
- **Container app — tfs-functions** — `az containerapp create --kind functionapp` (requires the `containerapp` CLI extension, installed earlier in the workflow); acts as create-or-update on re-runs
