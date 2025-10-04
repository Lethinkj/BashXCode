/**
 * Database Connection Manager
 * Handles Supabase PostgreSQL connections with proper pooling and error handling
 */

import postgres from 'postgres';

// Create a single database connection instance with optimized settings
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  max_lifetime: 60 * 30, // Maximum lifetime of a connection (30 minutes)
  prepare: false, // Disable prepared statements (better for serverless)
});

/**
 * Execute a query with automatic retry on timeout
 */
export async function queryWithRetry<T>(
  queryFn: (sql: any) => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn(sql as any);
    } catch (error: any) {
      lastError = error;
      
      // Only retry on timeout errors
      if (error.code === 'CONNECT_TIMEOUT' && attempt < maxRetries) {
        console.log(`Query timeout on attempt ${attempt + 1}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

export default sql;
