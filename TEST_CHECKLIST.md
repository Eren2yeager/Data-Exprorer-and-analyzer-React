# Frontend Testing Checklist

## 🧪 Testing the Updated Frontend

### Prerequisites
- ✅ Backend server running on http://localhost:4000
- ✅ Frontend dev server ready to start

### Test Sequence

#### 1. Start Frontend
```bash
cd Front-end
npm run dev
# or
pnpm dev
```

#### 2. Test Connection Flow
- [ ] Open http://localhost:5173
- [ ] Enter connection string
- [ ] Click "Connect"
- [ ] Should redirect to /databases
- [ ] Check browser console for errors
- [ ] Check localStorage for `mongoSessionId`

#### 3. Test Session Persistence
- [ ] Refresh the page
- [ ] Should stay on /databases (not redirect to /)
- [ ] Session should be validated

#### 4. Test Database Operations
- [ ] List databases should load
- [ ] Click on a database
- [ ] Collections should load

#### 5. Test Session Expiration
- [ ] Wait 30 minutes OR restart backend
- [ ] Try to navigate
- [ ] Should redirect to connection page
- [ ] Should show session expired message

#### 6. Test Disconnect
- [ ] Click disconnect (if button exists)
- [ ] Should redirect to connection page
- [ ] localStorage should be cleared

## 🐛 Common Issues & Fixes

### Issue: "Session ID is required" error
**Fix**: Check if axios interceptor is adding X-Session-Id header

### Issue: Stuck on connection page
**Fix**: Check if session validation is working in connection context

### Issue: 401 errors
**Fix**: Session expired or invalid, should auto-redirect

### Issue: CORS errors
**Fix**: Check backend CORS configuration

## ✅ Success Criteria

- [ ] Can connect to MongoDB
- [ ] Session persists across page refreshes
- [ ] Can navigate between pages
- [ ] Can view databases and collections
- [ ] Session expiration handled gracefully
- [ ] No console errors (except expected ones)

## 📊 What to Check

### Browser DevTools - Network Tab
- Connection request should return `sessionId`
- Subsequent requests should have `X-Session-Id` header
- No connection string in request bodies

### Browser DevTools - Application Tab
- localStorage should have `mongoSessionId`
- localStorage should have `connectionInfo`

### Browser DevTools - Console
- No critical errors
- Session validation logs (if any)

## 🎯 Next Steps After Testing

If tests pass:
1. ✅ Core integration is working!
2. Move to adding Phase 2 features
3. UI/UX improvements

If tests fail:
1. Check error messages
2. Verify backend is running
3. Check API service configuration
4. Review connection context logic
