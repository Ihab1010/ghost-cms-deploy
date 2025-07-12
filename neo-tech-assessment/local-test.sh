#!/bin/bash

# Simulate Jenkins environment variables
export AWS_ACCESS_KEY_ID="TEST_AWS_ACCESS_KEY"
export AWS_SECRET_ACCESS_KEY="TEST_AWS_SECRET_KEY"
export SLACK_WEBHOOK="https://hooks.slack.com/services/TEST/WEBHOOK/URL"

echo "=== Stage: Checkout ==="
echo "📦 Simulating Git checkout"
# git clone <your repo> or skip if already there

echo "=== Stage: Semgrep SAST ==="
echo "🔍 Installing Semgrep (simulated)"
pip install semgrep
echo "Running Semgrep scan"
semgrep --config=semgrep/semgrep.yml --json > semgrep-results.json || true
echo "📤 Simulating Slack webhook POST"
cat semgrep-results.json

echo "=== Stage: CDK Deploy ==="
echo "🚀 Simulating CDK deployment"
npm install -g aws-cdk
npm install
cdk synth

echo "✅ All stages completed (Local test)"
