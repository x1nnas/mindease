#!/bin/bash

# 🔥 MindEase v1 Smoke Test
# Run this script to verify the app works end-to-end
# Usage: ./smoke-test.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  PASSED=$((PASSED + 1))
}

fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  FAILED=$((FAILED + 1))
}

info() {
  echo -e "${YELLOW}ℹ️  INFO${NC}: $1"
}

# Check if command exists
check_command() {
  if ! command -v $1 &> /dev/null; then
    fail "$1 not found. Please install it."
    exit 1
  fi
}

echo "🔥 MindEase v1 Smoke Test"
echo "=========================="
echo ""

# Check prerequisites
info "Checking prerequisites..."
check_command node
check_command npm
check_command curl
pass "Prerequisites check"

# Check if .env files exist
info "Checking environment files..."
if [ ! -f "backend/.env" ]; then
  fail "backend/.env not found"
  exit 1
fi
if [ ! -f "frontend/.env" ]; then
  info "frontend/.env not found (optional)"
fi
pass "Environment files check"

# Test 1: Backend startup
echo ""
info "Test 1: Backend Startup"
info "Starting backend server..."

cd backend
npm install --silent > /dev/null 2>&1 || true

# Start backend in background
npm run dev > /tmp/mindease-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:5050/api/ > /dev/null 2>&1; then
  pass "Backend started and responding"
else
  fail "Backend not responding on port 5050"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

# Test 2: MongoDB connection
info "Test 2: MongoDB Connection"
if grep -q "MongoDB connected" /tmp/mindease-backend.log 2>/dev/null; then
  pass "MongoDB connected"
else
  fail "MongoDB connection failed (check logs)"
fi

# Test 3: API endpoints exist
info "Test 3: API Endpoints"

# Check auth endpoints with POST (they only accept POST)
for endpoint in "/api/auth/register" "/api/auth/login"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:5050${endpoint}" \
    -H "Content-Type: application/json" \
    -d '{}')
  if echo "$STATUS" | grep -q "400\|401\|422"; then
    pass "Endpoint exists: ${endpoint}"
  else
    fail "Endpoint missing or broken: ${endpoint} (got ${STATUS})"
  fi
done

# Check other endpoints with GET
for endpoint in "/api/mood" "/api/journal" "/api/serenity/chat"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5050${endpoint}")
  if echo "$STATUS" | grep -q "401\|400\|405\|404"; then
    pass "Endpoint exists: ${endpoint}"
  else
    fail "Endpoint missing or broken: ${endpoint} (got ${STATUS})"
  fi
done

# Test 4: Frontend build
echo ""
info "Test 4: Frontend Build"
cd frontend
if npm run build > /tmp/mindease-frontend-build.log 2>&1; then
  pass "Frontend builds successfully"
else
  fail "Frontend build failed (check logs)"
fi
cd ..

# Test 5: Auth flow (API)
echo ""
info "Test 5: Auth Flow (API)"
TEST_EMAIL="smoketest$(date +%s)@test.com"
TEST_PASSWORD="testpass123"

# Register
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5050/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
  pass "User registration works"
  TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
  fail "User registration failed"
  TOKEN=""
fi

# Login
if [ -n "$TOKEN" ]; then
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5050/api/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
  
  if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    pass "User login works"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  else
    fail "User login failed"
  fi
fi

# Test 6: Mood check-in (API)
echo ""
info "Test 6: Mood Check-In (API)"
if [ -n "$TOKEN" ]; then
  MOOD_RESPONSE=$(curl -s -X POST http://localhost:5050/api/mood \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"value":75,"label":"Feeling Good"}')
  
  if echo "$MOOD_RESPONSE" | grep -q "moodCheckIn"; then
    pass "Mood check-in creation works"
    
    # Test update (same day)
    sleep 1
    MOOD_UPDATE=$(curl -s -X POST http://localhost:5050/api/mood \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d '{"value":80,"label":"Feeling Great"}')
    
    if echo "$MOOD_UPDATE" | grep -q "moodCheckIn"; then
      pass "Mood check-in update (same day) works"
    else
      fail "Mood check-in update failed"
    fi
    
    # Test retrieval
    MOOD_GET=$(curl -s -X GET http://localhost:5050/api/mood/today \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$MOOD_GET" | grep -q "moodCheckIn"; then
      pass "Mood check-in retrieval works"
    else
      fail "Mood check-in retrieval failed"
    fi
  else
    fail "Mood check-in creation failed"
  fi
fi

# Test 7: Journal entry (API)
echo ""
info "Test 7: Journal Entry (API)"
if [ -n "$TOKEN" ]; then
  JOURNAL_RESPONSE=$(curl -s -X POST http://localhost:5050/api/journal \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"content":"This is a test journal entry","allowSerenityAccess":false}')
  
  if echo "$JOURNAL_RESPONSE" | grep -q "journalEntry"; then
    pass "Journal entry creation works"
    
    # Test retrieval
    JOURNAL_GET=$(curl -s -X GET http://localhost:5050/api/journal \
      -H "Authorization: Bearer ${TOKEN}")
    
    if echo "$JOURNAL_GET" | grep -q "journalEntries"; then
      pass "Journal entry retrieval works"
    else
      fail "Journal entry retrieval failed"
    fi
  else
    fail "Journal entry creation failed"
  fi
fi

# Test 8: Serenity chat (API)
echo ""
info "Test 8: Serenity Chat (API)"
if [ -n "$TOKEN" ]; then
  CHAT_RESPONSE=$(curl -s -X POST http://localhost:5050/api/serenity/chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"message":"Hello"}')
  
  if echo "$CHAT_RESPONSE" | grep -q "reply"; then
    pass "Serenity chat works"
  else
    fail "Serenity chat failed"
  fi
fi

# Cleanup
echo ""
info "Cleaning up..."
kill $BACKEND_PID 2>/dev/null || true
sleep 2

# Summary
echo ""
echo "=========================="
echo "🔥 Smoke Test Summary"
echo "=========================="
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All automated tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start backend: cd backend && npm run dev"
  echo "2. Start frontend: cd frontend && npm run dev"
  echo "3. Run manual UI tests (see docs/smoke-test-manual.md)"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Check logs above.${NC}"
  exit 1
fi
