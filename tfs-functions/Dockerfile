# To enable ssh & remote debugging on app service change the base image to the one below
# FROM mcr.microsoft.com/azure-functions/node:4-node22-appservice
FROM mcr.microsoft.com/azure-functions/node:4-node22

ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true

WORKDIR /home/site/wwwroot

# Copy package.json and install packages before copying the rest of the code to enable caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the code
COPY . .

# Compile TypeScript
RUN npm run build
