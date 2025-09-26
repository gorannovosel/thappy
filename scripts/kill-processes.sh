#!/bin/bash

echo "Killing all development processes..."

# Kill frontend processes
pkill -f "pnpm start" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
pkill -f "fork-ts-checker-webpack-plugin" 2>/dev/null || true
pkill -f "node.*start.js" 2>/dev/null || true

# Kill backend processes
pkill -f "go run.*cmd/api" 2>/dev/null || true

# Kill compiled API processes on port 8081
if lsof -i :8081 >/dev/null 2>&1; then
    echo "Killing processes on port 8081..."
    lsof -ti :8081 | xargs kill 2>/dev/null || true
fi

# Kill compiled API processes on port 3004
if lsof -i :3004 >/dev/null 2>&1; then
    echo "Killing processes on port 3004..."
    lsof -ti :3004 | xargs kill 2>/dev/null || true
fi

echo "All processes killed"