# Stage 1 — install and build
# lockfile lives at the root so we need to use the root workspace
# this is due to the workspaces structure
FROM node:22-alpine AS builder

WORKDIR /build

COPY package.json package-lock.json ./
COPY tfs-functions/package.json ./tfs-functions/
RUN npm ci --legacy-peer-deps

COPY tfs-functions/ ./tfs-functions/
RUN npm run build -w tfs-functions

# Stage 2 — functions runtime
# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/node:4-node22-appservice
FROM mcr.microsoft.com/azure-functions/node:4-node22

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

COPY --from=builder /build/node_modules/ /home/site/wwwroot/node_modules/
COPY --from=builder /build/tfs-functions/ /home/site/wwwroot/
