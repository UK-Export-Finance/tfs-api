#!/usr/bin/env bash
# Creates a basic Halo ticket, useful for exploring the Halo API and confirming
# ticket type IDs and required fields.
#
# Usage:
#   ./scripts/create-halo-ticket.sh
#
# Reads credentials from the .env file in the tfs-functions directory.
# Requires: curl, node

set -euo pipefail

pretty_print_json() {
  node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{console.log(JSON.stringify(JSON.parse(d),null,2))}catch(e){console.log(d)}})"
}

extract_json_field() {
  local field="$1"
  node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d)['${field}']??''))"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

# Load env vars from .env (ignores comment lines)
set -o allexport
# shellcheck disable=SC1090
source <(grep -v '^#' "$ENV_FILE" | grep -v '^$')
set +o allexport

echo "--- Acquiring Halo access token ---"
echo "Auth URL: ${HALO_BASE_URL}/auth/token?tenant=${HALO_TENANT_NAME}"

TOKEN_RESPONSE=$(curl -s -w '\n%{http_code}' -X POST "${HALO_BASE_URL}/auth/token?tenant=${HALO_TENANT_NAME}" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=client_credentials" \
  --data-urlencode "client_id=${HALO_AUTH_CLIENT_ID}" \
  --data-urlencode "client_secret=${HALO_CLIENT_SECRET}" \
  --data-urlencode "tenant=${HALO_TENANT_NAME}" \
  --data-urlencode "scope=all")

TOKEN_HTTP_STATUS=$(echo "$TOKEN_RESPONSE" | tail -n1)
TOKEN_BODY=$(echo "$TOKEN_RESPONSE" | head -n-1)

echo "HTTP status: ${TOKEN_HTTP_STATUS}"
echo "Token response:"
echo "$TOKEN_BODY" | pretty_print_json

ACCESS_TOKEN=$(echo "$TOKEN_BODY" | extract_json_field 'access_token')

if [[ -z "$ACCESS_TOKEN" || "$ACCESS_TOKEN" == "null" ]]; then
  echo "Error: failed to acquire access token"
  exit 1
fi

echo ""
echo "--- Creating Halo ticket ---"
echo "Tickets URL: ${HALO_BASE_URL}/api/Tickets"

TICKET_RESPONSE=$(curl -s -w '\n%{http_code}' -X POST "${HALO_BASE_URL}/api/Tickets" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "[
    {
      \"summary\": \"new GIFT team Test ticket from tfs-functions script\",
      \"details\": \"This is a test ticket created by the create-halo-ticket.sh script to explore the Halo API.\",
      \"tickettype_id\": ${HALO_TICKET_TYPE_ID},
      \"client_id\": ${HALO_TICKET_CLIENT_ID},
      \"site_id\": ${HALO_SITE_ID},
      \"user_id\": ${HALO_USER_ID},
      \"team_id\": ${HALO_TEAM_ID},
      \"itil_tickettype_id\": -1,
      \"dont_do_rules\": true,
      \"donotapplytemplateintheapi\": true,
      \"return_this\": true
    }
  ]")

TICKET_HTTP_STATUS=$(echo "$TICKET_RESPONSE" | tail -n1)
TICKET_BODY=$(echo "$TICKET_RESPONSE" | head -n-1)

echo "HTTP status: ${TICKET_HTTP_STATUS}"
echo "Ticket response:"
echo "$TICKET_BODY" | pretty_print_json
