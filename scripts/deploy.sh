#!/usr/bin/env bash
set -euo pipefail

echo "Building and starting Risk Oracle stack..."
docker-compose build
docker-compose up -d

echo "Deployment complete."
