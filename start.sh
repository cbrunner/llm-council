#!/bin/bash

# LLM Council - Start script
# Runs both backend (port 8001) and frontend (port 5000)

echo "Starting LLM Council..."

# Start backend in background
python -m backend.main &
BACKEND_PID=$!

# Start frontend in background
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait
