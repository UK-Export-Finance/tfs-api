# tfs-functions

This package contains an Azure Functions app with a storage queue trigger.

The main queue trigger is defined in `src/functions/process-queue-item.ts` and listens on the
`gift-requests` queue using the `AzureWebJobsStorage` connection. When a message is received, the
function calls the appropriate `/api/v2/gift/facility` endpoint on `tfs-api` to process the facility creation or amendment.
The call is retried five times; after that, a Halo support ticket is automatically raised via `src/utils/create-halo-ticket.ts`
before the error is rethrown (causing the message to be moved to the poison queue).

## Prerequisites

- Node.js 22 or later
- npm
- Docker Desktop for local container builds
- Azure Functions Core Tools
- Azure CLI

## Run the host locally (without Docker)

1. Copy `local.settings.json.sample` to `local.settings.json` and fill in the values:
   - `TFS_API_KEY` — must match the `API_KEY` env var set in `tfs-api`
   - `HALO_BASE_URL`, `HALO_TENANT_NAME`, `HALO_AUTH_CLIENT_ID`, `HALO_CLIENT_SECRET` — Halo credentials (see [Halo integration](#halo-integration))
   - `HALO_TICKET_CLIENT_ID`, `HALO_TICKET_TYPE_ID`, `HALO_SITE_ID`, `HALO_USER_ID`, `HALO_TEAM_ID` — Halo ticket field IDs (defaults are pre-populated in the sample)
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

To test the function in isolation (without running tfs-api), encode a valid JSON payload matching the `GiftFacilityCreationRequestDto` or `GiftFacilityAmendmentRequestDto` shape as Base64 and post it directly:

```bash
# Encode your payload
PAYLOAD='{"consumer":"DTFS","overview":{"facilityId":"0030000321",...},...}'
ENCODED_PAYLOAD=$(echo -n "$PAYLOAD" | base64)

az storage message put \
  --queue-name gift-requests \
  --content "$ENCODED_PAYLOAD" \
  --connection-string "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;QueueEndpoint=http://localhost:10001/devstoreaccount1;"
```

The function container log should show the message was received and the `POST /api/v2/gift/facility` call was made.

Without running `tfs-api` locally, this call will fail.

### Triggering the poison queue

To test the poison queue handler directly, put a message onto the poison queue:

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
   - `HALO_BASE_URL`, `HALO_TENANT_NAME`, `HALO_AUTH_CLIENT_ID`, `HALO_CLIENT_SECRET` — Halo credentials (see [Halo integration](#halo-integration))
   - `HALO_TICKET_CLIENT_ID`, `HALO_TICKET_TYPE_ID`, `HALO_SITE_ID`, `HALO_USER_ID`, `HALO_TEAM_ID` — Halo ticket field IDs (defaults are pre-populated in the sample)
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

## Halo integration

When a GIFT facility creation or amendment request fails, the function raises a support ticket in Halo PSA before rethrowing the error. The ticket includes the facility ID, the full original payload, and the error message.

Authentication uses OAuth2 client credentials (`HALO_AUTH_CLIENT_ID` / `HALO_CLIENT_SECRET`) against the `HALO_BASE_URL` tenant.

To test locally, you will need to have access to the Halo Test environment and set these authentication credentials in line with that. The variables below will make more sense when cross-referenced with the Halo UI.

### Environment variables

| Variable | Description |
| --- | --- |
| `HALO_BASE_URL` | Base URL of the Halo PSA instance (e.g. `https://your-org.halopsa.com`) |
| `HALO_TENANT_NAME` | Halo tenant name used in the auth token request |
| `HALO_AUTH_CLIENT_ID` | OAuth2 client ID for acquiring access tokens |
| `HALO_CLIENT_SECRET` | OAuth2 client secret for acquiring access tokens |
| `HALO_TICKET_CLIENT_ID` | Halo client ID to assign to created tickets |
| `HALO_TICKET_TYPE_ID` | Halo ticket type ID for created tickets |
| `HALO_SITE_ID` | Halo site ID to assign to created tickets |
| `HALO_USER_ID` | Halo user ID to assign to created tickets |
| `HALO_TEAM_ID` | Halo team ID to assign to created tickets |

### Testing the failure path locally

To trigger a Halo ticket during local testing, put a message onto the queue that will cause the GIFT facility creation or amendment to fail (e.g. an invalid payload). The function will attempt the GIFT call, fail, and then call Halo before moving the message to the poison queue - after the 5th retry.

You can then look at the Halo test environment to see the ticket you've raised.

## Azure deployment

### Architecture

The full request flow on Azure is:

APIM → tfs-api (Container App) → Azure Storage Queue → tfs-functions (Container App) → GIFT API

All components run inside a single **Container Apps Environment** (`cae-apim-<env>-<version>`), 
deployed into a private VNet subnet. 
Access to the storage account is via a **private endpoint**.

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
| `id-apim-functions-*` | Storage Blob Data Owner | Storage account | Required by the Functions webjobs runtime since we are using managed identity, and for host locks/heartbeats |
| `id-apim-functions-*` | Storage Queue Data Contributor | Storage account | Required by the Functions webjobs runtime for internal runtime queues and poison queues |
| Both | AcrPull | Container registry | Allows both apps to pull images from ACR |

### Authentication to the storage queue

Both container apps authenticate to the storage account using **managed identity** — no connection strings or storage keys are used. 
The tfs-functions container app is configured with:

```
AzureWebJobsStorage__accountName = stapimfn<env><version>
AzureWebJobsStorage__credential  = managedidentity
AzureWebJobsStorage__clientId    = <client ID of id-apim-functions-*>
```

The `__accountName` / `__credential` / `__clientId` convention is the Azure Functions v4 passwordless storage binding format. The Functions runtime uses this to acquire tokens via the managed identity rather than a connection string.

### Storage Account

The storage account serves two functions:

1. **Queue trigger** — the `gift-requests` queue receives messages from the TFS API and triggers the functions app
2. **Functions webjobs runtime** — `AzureWebJobsStorage` uses the same storage account for host locks, function key storage, and instance heartbeats

### Infrastructure provisioning

All of the above is provisioned by `.github/workflows/infrastructure.yml` in the root of this repository.
