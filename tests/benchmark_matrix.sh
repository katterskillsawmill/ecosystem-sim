#!/bin/bash
echo "--- [F100 CONSTELLATION BENCHMARK] ---"
echo "Starting FastAPI server in the background for testing..."
cd /root/ecosystems/ecosystem-sim/backend
source venv/bin/activate
python3 server.py &
SERVER_PID=$!

echo "Waiting for server to boot..."
sleep 5

echo "--- STARTING PARALLEL STRESS TEST ---"
echo "1. K6 Load Generator (200 Virtual Users) hitting /api/ooda/execute"
echo "2. Playwright Embodied Actor hitting the UI endpoints"

# Run Playwright in parallel in the background
source venv/bin/activate
python3 embodied_qa.py &
PLAYWRIGHT_PID=$!

# Run K6 in the foreground
cd /root/ecosystems/ecosystem-sim/tests
k6 run k6-load.js

echo "Waiting for Playwright to finish..."
wait $PLAYWRIGHT_PID

echo "--- BENCHMARK COMPLETE ---"
kill $SERVER_PID
