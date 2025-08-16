#!/bin/bash

echo "Fixing Next.js Chunk Loading Errors..."
echo

echo "Stopping any running Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

echo "Cleaning build cache..."
rm -rf .next
rm -f tsconfig.tsbuildinfo

echo "Reinstalling dependencies..."
npm install

echo "Starting development server..."
npm run dev

echo
echo "Chunk loading errors should now be fixed!"
