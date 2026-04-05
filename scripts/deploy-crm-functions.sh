#!/bin/bash
# Deploy all CRM edge functions to Supabase
# Usage: bash scripts/deploy-crm-functions.sh

set -e

PROJECT_REF="fnsnnezhikgqajdbtwoa"

FUNCTIONS=(
  "_shared"
  "crmListLeads"
  "crmGetLead"
  "crmCreateLead"
  "crmUpdateLeadStage"
  "crmDeleteLead"
  "crmAddCommunication"
  "crmAddTask"
  "crmCompleteTask"
  "crmBulkAction"
  "crmExportLeads"
  "crmGetDashboard"
)

echo "Deploying CRM edge functions to project: $PROJECT_REF"
echo ""

for fn in "${FUNCTIONS[@]}"; do
  if [ "$fn" = "_shared" ]; then
    continue  # shared module is included automatically
  fi
  echo "Deploying $fn..."
  npx supabase functions deploy "$fn" --project-ref "$PROJECT_REF" --no-verify-jwt
  echo "  Done."
done

echo ""
echo "All CRM functions deployed successfully!"
