# 🚀 MindEase Pre-Deployment Readiness Checklist

**Date:** Pre-v1 Launch  
**Status:** Pre-Deployment Verification  
**Goal:** Ensure production-ready stability before hosting

---

## 1. Frontend Build & Environment

### Build Configuration
- [x] ✅ **FIXED** TypeScript errors resolved (duplicate keys, missing translations)
- [ ] Run `npm run build` successfully (no TypeScript errors) - **MANUAL: Test after fixing .env permissions**
- [ ] Check `dist/` folder is generated correctly
- [ ] Verify all assets are included in build output
- [x] ✅ No hardcoded `localhost` URLs in source code (only in config/env.ts as default)
- [ ] Test production build locally: `npm run preview` works

### Environment Variables
- [ ] **CRITICAL**: Create `frontend/.env.production` file (or set in hosting platform)
- [ ] **CRITICAL**: Set `VITE_API_URL` to production backend URL (not localhost:5050)
- [ ] Set `VITE_SENTRY_DSN` for production error tracking (optional but recommended)
- [ ] Set `VITE_APP_VERSION` if using version tracking
- [x] ✅ Verified `.env` file is in `.gitignore`
- [ ] **MANUAL**: Test that build uses production env vars (not dev defaults)

### Production vs Preview Behavior ✅ **VERIFIED**
- [x] ✅ `import.meta.env.PROD` checks found in `env.ts` and `sentry.ts`
- [x] ✅ Sentry diagnostics panel guarded with `import.meta.env.DEV` (EntryPage, HomePage, SentryDiagnostics)
- [x] ✅ Error testing components guarded with `import.meta.env.DEV` (ErrorTesting, sentryTest)
- [x] ✅ ErrorFallback shows details only in dev mode
- [ ] **MANUAL**: Test that console warnings/errors are appropriate for production

### Console Errors or Warnings
- [ ] Run production build and check browser console (should be clean)
- [x] ⚠️ Found 16 `console.log()` statements (mostly in error logging/utils - acceptable for dev)
  - `errorLogger.ts`, `SentryDiagnostics.tsx`, `sentryTest.ts`, `main.tsx`, `sentry.ts`, `AuthProvider.tsx`
  - **ACTION**: Review and guard with `import.meta.env.DEV` if needed
- [ ] Verify no React warnings (keys, hooks, etc.)
- [x] ✅ TypeScript errors fixed (duplicate keys, missing translations)

---

## 2. Routing & Entry Points

### Landing Page Behavior
- [ ] `/` (root) shows `EntryPage` for unauthenticated users
- [ ] `/` redirects to `/welcome` for authenticated users
- [ ] Desktop users see QR code gate (cannot proceed without bypass)
- [ ] Mobile users see install prompt and "Continue in browser" option
- [ ] Desktop bypass (`?desktop=true`) works for testing (remove in production if needed)

### Mobile vs Desktop Handling
- [ ] `EntryPage` correctly detects mobile vs desktop (`useIsMobile` hook)
- [ ] Desktop view shows QR code and mobile-first message
- [ ] Mobile view shows install button and continue option
- [ ] QR code generates correctly with current URL
- [ ] Test on real mobile device (not just browser dev tools)

### Installed PWA Start Behavior ✅ **CONFIGURED**
- [x] ✅ PWA `start_url` set to `/app` (bypasses EntryPage gate)
- [x] ✅ `/app` route created: authenticated → WelcomePage, unauthenticated → AuthPage
- [ ] **MANUAL**: Test installed PWA launch behavior on real device
- [ ] **MANUAL**: Verify no blank screen or loading issues on PWA launch

### Route Protection
- [ ] All protected routes (`/home`, `/chat`, `/journal`, `/mood-check-in`) redirect to `/` if not authenticated
- [ ] Auth routes (`/auth`, `/welcome`) redirect to `/home` if already authenticated
- [ ] Transition routes (`/mood-transition`, `/mood-skip`) are protected
- [ ] No route allows access without proper auth state

---

## 3. PWA Configuration ✅ **COMPLETED**

### manifest.json ✅ **CREATED & CONFIGURED**
- [x] ✅ Created `frontend/public/manifest.json`
- [x] ✅ Set `name`: "MindEase - Your Emotional Wellness Companion"
- [x] ✅ Set `short_name`: "MindEase"
- [x] ✅ Set `start_url`: "/app" (bypasses EntryPage gate for installed PWAs)
- [x] ✅ Set `display`: "standalone"
- [x] ✅ Set `theme_color`: "#1a241f"
- [x] ✅ Set `background_color`: "#1a241f"
- [x] ✅ Set `orientation`: "portrait"
- [x] ✅ Added `icons` array with 192x192 and 512x512
- [x] ✅ Linked manifest in `index.html`

### Icons ✅ **VERIFIED**
- [x] ✅ App icon (192x192 PNG) exists at `/public/icons/icon-192.png`
- [x] ✅ App icon (512x512 PNG) exists at `/public/icons/icon-512.png`
- [x] ✅ Favicon configured in `index.html` (uses icon-192.png)
- [x] ✅ Apple-touch-icon configured in `index.html` (uses icon-192.png)
- [ ] ⚠️ **OPTIONAL**: Create dedicated 180x180 icon for iOS (currently uses 192x192)

### Service Worker ⚠️ **NOT CONFIGURED - OPTIONAL FOR V1**
- [ ] **DECISION NEEDED**: Do you want offline support for v1?
  - **Option A (Recommended for v1)**: Skip service worker - simpler, fewer edge cases
  - **Option B**: Add basic service worker for caching (more complex, potential issues)
- [ ] If adding SW: Install `vite-plugin-pwa` or similar
- [ ] If adding SW: Configure caching strategy (network-first recommended)
- [ ] If adding SW: Test offline behavior
- [ ] **Note**: PWA can work without service worker, but won't be "installable" on all browsers

### HTML Meta Tags ✅ **COMPLETED**
- [x] ✅ Updated `<title>` to "MindEase"
- [x] ✅ Added `<meta name="description">` for SEO/share previews
- [x] ✅ Added `<meta name="theme-color">` set to "#1a241f"
- [x] ✅ Viewport meta tag includes `maximum-scale=1.0, user-scalable=no`
- [x] ✅ Added `viewport-fit=cover` for notch support

---

## 4. Mobile UX Verification

### Real Device Testing
- [ ] Test on actual iPhone (Safari)
- [ ] Test on actual Android phone (Chrome)
- [ ] Test on tablet (iPad/Android tablet) - should work but may need adjustments
- [ ] Verify touch interactions work smoothly
- [ ] Check that buttons are large enough for thumb taps (min 44x44px)

### Keyboard Behavior
- [ ] Chat input: Keyboard doesn't cover input bar
- [ ] Journal textarea: Keyboard doesn't cover text area
- [ ] Auth forms: Keyboard doesn't cover submit button
- [ ] Input fields focus correctly when tapped
- [ ] Keyboard dismisses appropriately (on submit, on blur)

### Bottom Navigation Spacing
- [ ] Input bar in ChatPage has proper spacing above bottom nav (120px+)
- [ ] Journal page content doesn't overlap bottom nav
- [ ] Home page buttons don't overlap bottom nav
- [ ] Bottom nav is always visible on authenticated pages (except chat)
- [ ] Bottom nav hides correctly on auth/welcome/entry pages

### Large Phone Layouts
- [ ] Test on iPhone Pro Max / large Android phones
- [ ] Content doesn't stretch awkwardly on large screens
- [ ] Text remains readable (not too large)
- [ ] Spacing remains balanced
- [ ] Bottom nav is accessible without stretching

### Animations Performance
- [ ] All page transitions are smooth (no jank)
- [ ] Animations don't cause layout shifts
- [ ] No performance warnings in Chrome DevTools
- [ ] Test on lower-end device (if possible) - animations still smooth
- [ ] Verify `will-change` or `transform` optimizations where needed

---

## 5. Install Experience

### Android (Chrome) Install Prompt
- [ ] `beforeinstallprompt` event fires correctly
- [ ] Install button appears on EntryPage mobile view
- [ ] Clicking install button shows native Android install prompt
- [ ] After install, app opens correctly
- [ ] App icon appears on home screen with correct icon
- [ ] App name shows as "MindEase" (not "frontend")

### iOS (Safari) Add to Home Screen Flow
- [ ] "Add to Home Screen" instructions are clear (iOS doesn't support `beforeinstallprompt`)
- [ ] Share button → "Add to Home Screen" works
- [ ] App icon appears correctly on iOS home screen
- [ ] App opens in standalone mode (no Safari UI)
- [ ] Status bar styling matches app theme

### Clear User Guidance
- [ ] EntryPage mobile view explains install benefits clearly
- [ ] Install button text is clear ("Install MindEase" or "Add to Home Screen")
- [ ] "Continue in browser" option is visible and works
- [ ] No broken or misleading CTAs
- [ ] Users understand they can use app without installing

### Post-Install Behavior
- [ ] When opening installed PWA, it starts at correct route
- [ ] No "install prompt" shown if already installed
- [ ] App feels native (no browser chrome)
- [ ] Splash screen shows (if configured in manifest)

---

## 6. Auth & App Stability

### Login / Register Happy Path
- [ ] New user can register successfully
- [ ] Existing user can login successfully
- [ ] First name is saved and displayed correctly
- [ ] After login, user is redirected to `/welcome`
- [ ] Welcome page shows user's first name
- [ ] After welcome, user goes to mood check-in or home correctly

### Session Persistence
- [ ] Token is saved to `localStorage` on login
- [ ] User data is saved to `localStorage`
- [ ] On page refresh, user remains logged in
- [ ] Token is sent with all API requests
- [ ] Language preference persists across sessions

### Token Expiry Handling
- [ ] Expired token triggers logout and redirect to `/auth`
- [ ] User sees appropriate message (not technical error)
- [ ] Expired token doesn't cause infinite redirect loops
- [ ] API 401/403 responses are handled gracefully
- [ ] User can re-login after token expiry

### Logged-Out State Behavior
- [ ] Unauthenticated users can't access protected routes
- [ ] Unauthenticated users are redirected to `/` (EntryPage)
- [ ] No errors shown when accessing protected routes while logged out
- [ ] Auth state is cleared properly on logout
- [ ] Logout doesn't cause navigation issues

---

## 7. Error Handling & Resilience

### Global Error Boundary
- [ ] ErrorBoundary wraps entire app (verified in `main.tsx`)
- [ ] ErrorFallback component displays user-friendly message
- [ ] Error details only show in dev mode
- [ ] "Go to Home" button works correctly
- [ ] "Reload Page" button works correctly
- [ ] Errors are logged to Sentry (if configured)

### Graceful API Failures
- [ ] Network errors show user-friendly message (not "Failed to fetch")
- [ ] API timeout errors are handled
- [ ] Rate limit errors show appropriate message
- [ ] Daily limit errors show appropriate message
- [ ] 500 errors don't crash the app
- [ ] User can retry after API failure

### Loading States
- [ ] Initial app load shows loading screen with logo
- [ ] Mood check-in fetch shows loading state
- [ ] Journal entries fetch shows loading state
- [ ] Serenity responses show typing indicator
- [ ] No "dead air" moments (everything has loading feedback)
- [ ] Loading states are consistent across pages

### Empty States
- [ ] Empty journal shows "No entries yet" message
- [ ] Empty mood history handled gracefully
- [ ] Empty chat shows welcome message (not blank)
- [ ] Empty states are user-friendly and actionable

---

## 8. Performance & Polish

### Initial Load Time
- [ ] First load is under 3 seconds on 4G connection
- [ ] Test with Chrome DevTools throttling (Slow 3G)
- [ ] Loading screen appears immediately (no white flash)
- [ ] Critical CSS is inlined or loaded first
- [ ] No render-blocking resources

### Bundle Size Sanity
- [ ] Run `npm run build` and check bundle sizes
- [ ] Main bundle is reasonable (< 500KB gzipped ideal)
- [ ] No unexpectedly large dependencies
- [ ] Code splitting is working (if implemented)
- [ ] Check for duplicate dependencies

### Image/SVG Optimization
- [ ] All SVGs are optimized (no unnecessary code)
- [ ] Images are properly sized (not loading 2000px images for 200px display)
- [ ] Consider converting frequently used SVGs to React components
- [ ] Verify no broken image references

### No Unnecessary Re-renders
- [ ] Check React DevTools Profiler for excessive renders
- [ ] Memoization used where appropriate (if needed)
- [ ] Context providers don't cause cascade re-renders
- [ ] Language changes don't cause full app re-render

---

## 9. Final "Demo Safety" Checks

### What Could Realistically Fail Live
- [ ] **API Connection**: Backend down → App shows graceful error, user can retry
- [ ] **Sentry Blocked**: Ad blockers → Falls back to localStorage logging
- [ ] **Token Expiry**: Mid-session expiry → User redirected to login cleanly
- [ ] **Network Timeout**: Slow connection → Loading states show, user can wait
- [ ] **Browser Compatibility**: Old browsers → Test on target browsers
- [ ] **PWA Install Fails**: Some browsers → User can still use in browser

### What to Avoid Showing in a Demo
- [ ] Don't show Sentry diagnostics panel (dev only)
- [ ] Don't show error details to users (dev only)
- [ ] Don't test with `?desktop=true` bypass (unless explaining it)
- [ ] Don't show console logs in production
- [ ] Don't demonstrate error scenarios unless asked

### Simple Recovery Actions if Something Goes Wrong
- [ ] **If app crashes**: User can reload page (ErrorBoundary handles it)
- [ ] **If API fails**: User sees friendly message, can retry
- [ ] **If stuck on loading**: User can refresh page
- [ ] **If auth breaks**: User can clear localStorage and re-login
- [ ] **If PWA won't install**: User can use browser version

### Pre-Demo Verification
- [ ] Clear browser cache and test fresh install
- [ ] Test on clean device/profile (no existing data)
- [ ] Verify all core flows work end-to-end
- [ ] Have backup plan if something fails (e.g., show screenshots)
- [ ] Test the exact flow you'll demonstrate

---

## 10. Critical Pre-Launch Items

### Must Fix Before Deployment
- [x] ✅ **Create `manifest.json`** - COMPLETED
- [x] ✅ **Create app icons** - VERIFIED (192x192, 512x512 exist)
- [x] ✅ **Update HTML title** - COMPLETED ("MindEase")
- [ ] **🚨 CRITICAL: Set production `VITE_API_URL`** - Currently defaults to localhost:5050
- [ ] ⚠️ **Review console.logs** - 16 found (mostly in error logging - acceptable, but review)

### Should Fix Before Deployment
- [ ] **Add meta description** - For SEO and share previews
- [ ] **Test on real devices** - Not just browser dev tools
- [ ] **Verify all environment variables** - Production values set correctly
- [ ] **Clean up any test/debug code** - Remove temporary bypasses if needed

### Nice to Have (Can Wait for Post-v1)
- [ ] Service worker for offline support
- [ ] Advanced PWA features (push notifications, background sync)
- [ ] Performance optimizations beyond current state
- [ ] Additional error recovery mechanisms

---

## Ready to Deploy If:

✅ **All "Must Fix" items are complete**  
✅ **Build runs without errors**  
✅ **Production environment variables are set**  
✅ **Tested on at least one real mobile device**  
✅ **Core user flows work end-to-end**  
✅ **Error handling is graceful**  
✅ **No critical console errors in production build**

---

## Deployment Notes

### Environment Variables to Set in Production:
```bash
VITE_API_URL=https://your-production-api-url.com
VITE_SENTRY_DSN=https://your-sentry-dsn (optional)
VITE_APP_VERSION=1.0.0 (optional)
```

### Files to Create Before Deployment:
1. `frontend/public/manifest.json` - PWA manifest
2. `frontend/public/icon-192.png` - App icon (192x192)
3. `frontend/public/icon-512.png` - App icon (512x512)
4. `frontend/public/favicon.png` - Favicon (32x32)
5. `frontend/public/icon-180.png` - Apple touch icon (180x180)

### Quick Test Commands:
```bash
# Build for production
cd frontend && npm run build

# Test production build locally
npm run preview

# Check bundle size
ls -lh dist/assets/

# Verify no localhost references
grep -r "localhost" dist/
```

---

## ✅ Automated Test Results Summary

**Date:** Pre-v1 Launch  
**Automated Checks Performed:**

### ✅ Completed
- ✅ TypeScript errors fixed (duplicate keys, missing translations)
- ✅ PWA manifest.json created and configured
- ✅ Icons verified (192x192, 512x512 exist at `/public/icons/`)
- ✅ HTML meta tags configured (title, description, theme-color, viewport)
- ✅ `/app` route created for installed PWAs (bypasses EntryPage gate)
- ✅ Environment variable guards verified (DEV/PROD checks in place)
- ✅ `.env` in `.gitignore`
- ✅ No hardcoded localhost URLs in source code (only defaults in config)

### ⚠️ Issues Found
- **Build**: Permission error with `.env` file (sandbox restriction - test manually)
- **Console.logs**: 16 instances found (mostly in error logging - acceptable, but review)
- **Production API URL**: ⚠️ **CRITICAL** - Not set (defaults to localhost:5050)

### 🔍 Manual Testing Required
- [ ] Build production bundle (`npm run build`) - test after fixing .env permissions
- [ ] Test on real mobile devices (iPhone, Android)
- [ ] Verify PWA install flow (Android Chrome, iOS Safari)
- [ ] Test all user flows end-to-end
- [ ] Set production environment variables (`VITE_API_URL`, `VITE_SENTRY_DSN`)

**Last Updated:** Pre-v1 Launch  
**Next Review:** Post-deployment verification
