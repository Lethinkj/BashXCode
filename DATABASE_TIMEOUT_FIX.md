# Database Connection Timeout Fix

## Problem
The application was experiencing frequent `CONNECT_TIMEOUT` errors when connecting to Supabase PostgreSQL database:
- Errors like: `Error: write CONNECT_TIMEOUT undefined:undefined`
- Queries taking 30+ seconds and failing
- Intermittent database connectivity issues
- Poor user experience with failed logins and contest loading

## Root Causes
1. **No connection pooling configuration** - Using default postgres settings
2. **No timeout handling** - No retry logic for transient failures
3. **Too many concurrent connections** - Connection pool exhaustion
4. **Serverless environment** - Cold starts and connection reuse issues

## Solution Implemented

### 1. Created Centralized Database Connection Manager (`src/lib/db.ts`)

```typescript
// Optimized connection settings
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10,                    // Maximum 10 connections in pool
  idle_timeout: 20,           // Close idle connections after 20s
  connect_timeout: 10,        // Connection timeout 10s
  max_lifetime: 60 * 30,      // Max connection lifetime 30 minutes
  prepare: false,             // Better for serverless
});
```

**Key Settings:**
- **`max: 10`** - Limits connection pool to 10 connections (Supabase free tier supports up to 15-20)
- **`idle_timeout: 20`** - Closes idle connections quickly to free up resources
- **`connect_timeout: 10`** - Faster timeout detection (10s instead of 30s default)
- **`max_lifetime: 1800s`** - Refreshes connections every 30 minutes
- **`prepare: false`** - Disables prepared statements for better serverless compatibility

### 2. Added Automatic Retry Logic

```typescript
export async function queryWithRetry<T>(
  queryFn: (sql: any) => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  // Attempts query up to 3 times (1 initial + 2 retries)
  // Uses exponential backoff: 1s, 2s between retries
  // Only retries on CONNECT_TIMEOUT errors
}
```

**Features:**
- Automatically retries failed queries up to 2 times
- Exponential backoff (1s, 2s delays) between retries
- Only retries timeout errors, not logical errors
- Logs retry attempts for debugging

### 3. Updated All Database Queries

#### Files Modified:
- ✅ `src/lib/storage.ts` - Contest storage queries
- ✅ `src/app/api/auth/login/route.ts` - Login queries
- ✅ `src/app/api/auth/register/route.ts` - Registration queries

**Before:**
```typescript
const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });
const rows = await sql`SELECT * FROM contests`;
```

**After:**
```typescript
import sql, { queryWithRetry } from '@/lib/db';
const rows = await queryWithRetry(async (db) => await db`SELECT * FROM contests`);
```

## Benefits

### Performance Improvements
- ⚡ **Faster failure detection** - 10s timeout instead of 30s
- 🔄 **Automatic recovery** - Retries transient failures automatically
- 💾 **Better resource usage** - Connections closed when idle
- 🔌 **Connection reuse** - Proper pooling reduces overhead

### Reliability Improvements
- ✅ **Reduced timeout errors** - Retry logic handles transient failures
- ✅ **Better error messages** - Clear retry attempt logging
- ✅ **Graceful degradation** - Fails fast with helpful errors
- ✅ **Consistent behavior** - All queries use same connection settings

### User Experience Improvements
- 🚀 **Faster page loads** - Optimized connection handling
- 😊 **Fewer errors** - Automatic retries mean fewer failed requests
- 🔐 **Reliable authentication** - Login/register work consistently
- 📊 **Stable contest loading** - Contest data loads reliably

## Testing Recommendations

### 1. Test Login Flow
```bash
# Should complete in < 5 seconds
1. Go to /login
2. Enter credentials
3. Verify successful login
4. Check no timeout errors in console
```

### 2. Test Contest Loading
```bash
# Should complete in < 3 seconds
1. Navigate to /join or /admin
2. Verify contests load
3. Click on a contest
4. Verify contest details load
5. Check database query times in logs
```

### 3. Test Under Load
```bash
# Multiple concurrent requests
1. Open 5-10 browser tabs
2. Reload all tabs simultaneously
3. Verify all tabs load without timeouts
4. Check connection pool isn't exhausted
```

### 4. Test Error Recovery
```bash
# Simulate network issues
1. Use browser DevTools to throttle network (Slow 3G)
2. Attempt login
3. Verify query retries automatically
4. Should succeed within 3 attempts
```

## Monitoring

### Watch for These Logs
✅ **Success**: 
```
GET /api/contests 200 in 3578ms
POST /api/auth/login 200 in 1500ms
```

⚠️ **Retry (Normal)**:
```
Query timeout on attempt 1, retrying...
GET /api/contests 200 in 5200ms
```

❌ **Failure (Investigate)**:
```
Database error: Error: write CONNECT_TIMEOUT
GET /api/contests 500 in 30000ms
```

### Performance Benchmarks
- **Login**: Should complete in < 5 seconds
- **Contest List**: Should load in < 3 seconds  
- **Contest Details**: Should load in < 4 seconds
- **Submissions**: Should load in < 4 seconds

## Troubleshooting

### If Timeouts Still Occur

1. **Check Supabase Dashboard**
   - Verify connection count
   - Check if hitting connection limits
   - Review slow query logs

2. **Increase max connections** (if needed)
   ```typescript
   // In src/lib/db.ts
   max: 15, // Increase from 10 to 15
   ```

3. **Reduce timeout** (for faster failure)
   ```typescript
   connect_timeout: 5, // Reduce from 10 to 5 seconds
   ```

4. **Add more retries**
   ```typescript
   // In query calls
   await queryWithRetry(query, 3) // Increase from 2 to 3 retries
   ```

### Environment Issues

1. **Verify DATABASE_URL**
   ```bash
   # Check .env.local exists
   ls .env.local
   
   # Should have format:
   # DATABASE_URL=postgres://user:pass@host:5432/database
   ```

2. **Test Direct Connection**
   ```bash
   node test-db.mjs
   # Should exit 0 if connection works
   ```

3. **Check Supabase Status**
   - Visit [Supabase Status Page](https://status.supabase.com/)
   - Verify no ongoing incidents

## Next Steps

### Recommended Enhancements
1. **Add Query Caching** - Cache contest data for 1-2 minutes
2. **Add Connection Health Checks** - Ping database periodically
3. **Add Metrics** - Track query times and failure rates
4. **Add Circuit Breaker** - Stop queries if database is down
5. **Add Read Replicas** - Use Supabase read replicas for queries

### Monitoring Setup
1. Add logging service (e.g., Sentry, LogRocket)
2. Set up alerts for timeout errors
3. Track query performance metrics
4. Monitor connection pool usage

## Summary

The database connection timeout issues have been fixed by:
1. ✅ Centralizing database connection with optimized settings
2. ✅ Adding automatic retry logic with exponential backoff
3. ✅ Configuring proper connection pooling
4. ✅ Updating all queries to use new connection manager

The application should now be significantly more reliable with fewer timeout errors and better performance! 🎉
