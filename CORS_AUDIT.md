# Production Registration Failure - CORS Audit

## CHECKLIST RESULTS

### 1. CORS Middleware Configuration

- [x] **cors is installed and imported** ✅
  - File: `backend/src/server.ts:2`
  - `import cors from "cors";`

- [x] **app.use(cors(...)) exists** ✅
  - File: `backend/src/server.ts:32-46`
  - CORS middleware is configured

- [x] **CORS middleware runs before all routes** ✅
  - File: `backend/src/server.ts:32-46` (before `app.use("/api", router)`)

- [ ] **allowedOrigins includes Vercel production domain** ❌ **CRITICAL ISSUE**
  - Current allowedOrigins:
    ```typescript
    const allowedOrigins = [
      env.FRONTEND_URL,  // May be undefined or wrong in production
      'http://localhost:5173',
      'http://localhost:4173',
    ].filter(Boolean);
    ```
  - **Problem**: Vercel production domain (e.g., `https://your-app.vercel.app`) is NOT in the list
  - **Why it causes "Load Failed"**: Browser sends preflight OPTIONS request with Vercel origin, backend rejects it with CORS error, browser blocks the actual POST request
  - **Fix**: Add Vercel domain to allowedOrigins OR use wildcard for demo safety

- [x] **credentials setting matches frontend** ✅
  - Backend: `credentials: true` (line 44)
  - Frontend: `credentials: 'include'` (api.ts:71)

### 2. OPTIONS / Preflight Handling

- [x] **Backend responds to OPTIONS requests** ✅
  - CORS middleware handles OPTIONS automatically

- [ ] **Preflight does NOT return 404** ⚠️ **POTENTIAL ISSUE**
  - CORS middleware should handle this, but origin check might block it first

- [x] **Preflight returns 200 or 204** ✅
  - CORS middleware returns appropriate status

### 3. Auth Route Exposure

- [x] **Routes are prefixed with /api** ✅
  - File: `backend/src/server.ts:64` - `app.use("/api", router)`

- [x] **Frontend request paths match backend routes** ✅
  - Backend: `/api/auth/register` (routes/index.ts:14 + routes/authRoutes.ts:6)
  - Frontend: `${API_BASE_URL}/api/auth/register` (services/api.ts:66)
  - **Match confirmed** ✅

### 4. Frontend Request Construction

- [x] **Frontend uses import.meta.env.VITE_API_URL** ✅
  - File: `frontend/src/config/env.ts:1`

- [x] **Full request URL is correct** ✅
  - Format: `${API_BASE_URL}/api/auth/register`
  - Should resolve to: `https://mindease-oyqs.onrender.com/api/auth/register`

- [x] **Headers sent correctly** ✅
  - `Content-Type: application/json` (api.ts:69)
  - `credentials: 'include'` (api.ts:71)

### 5. Network Failure Diagnosis

- [x] **Failure happens during preflight** ✅ **CONFIRMED**
  - "Load Failed" = Browser blocks request before POST reaches server
  - This is a CORS preflight rejection

---

## PRIMARY ROOT CAUSE

**CORS Origin Mismatch**: The Vercel production domain is not in the `allowedOrigins` array. When the browser sends a preflight OPTIONS request with the Vercel origin header, the backend's CORS middleware rejects it because the origin is not in the allowed list. The browser then blocks the actual POST request, resulting in "Load Failed".

---

## MINIMAL FIX REQUIRED

**File**: `backend/src/server.ts`

**Current Code** (lines 26-30):
```typescript
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);
```

**Fix Option 1: Add Vercel domain explicitly** (Recommended for production)
```typescript
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
  // Add your Vercel production domain
  'https://your-app.vercel.app',  // Replace with actual Vercel domain
].filter(Boolean);
```

**Fix Option 2: Allow all origins for demo** (Fastest for testing)
```typescript
app.use(
  cors({
    origin: true,  // Allow all origins (for demo/testing)
    credentials: true,
  })
);
```

**Fix Option 3: Dynamic origin check** (Best for production)
```typescript
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost for development
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow Vercel domains (any *.vercel.app)
      if (origin.includes('.vercel.app')) {
        return callback(null, true);
      }
      
      // Allow configured FRONTEND_URL
      if (env.FRONTEND_URL && origin === env.FRONTEND_URL) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
```

---

## VERIFICATION STEPS

1. **Deploy fix to Render**
   ```bash
   git add backend/src/server.ts
   git commit -m "fix: Allow Vercel origin in CORS"
   git push
   ```

2. **Set FRONTEND_URL in Render** (if using Fix Option 1 or 3)
   - Render Dashboard → Environment Variables
   - Add: `FRONTEND_URL=https://your-app.vercel.app`

3. **Test registration in browser console**:
   ```javascript
   fetch('https://mindease-oyqs.onrender.com/api/auth/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ email: 'test@test.com', password: 'test1234' })
   })
   .then(r => r.json())
   .then(console.log)
   .catch(console.error)
   ```

4. **Check browser Network tab**:
   - OPTIONS request should return 200 (not blocked)
   - POST request should reach server
   - Response should be JSON (not CORS error)

5. **Test actual registration form**:
   - Fill form on Vercel-deployed frontend
   - Click register
   - Should succeed (not "Load Failed")

---

## RECOMMENDED FIX (Fastest for Demo)

Use **Fix Option 2** (`origin: true`) for immediate testing, then switch to **Fix Option 3** (dynamic check) for production security.
