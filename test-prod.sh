#!/bin/bash
echo "Building application..."
npm run build

echo "Starting production server..."
node server/prod.ts