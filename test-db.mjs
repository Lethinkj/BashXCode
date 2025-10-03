// Test database connection
import postgres from 'postgres';

const DATABASE_URL = "postgresql://postgres.aomjtfhjwsewrgubouma:aura%4012345@aws-1-us-east-2.pooler.supabase.com:5432/postgres";

async function testConnection() {
  const sql = postgres(DATABASE_URL, { 
    ssl: 'require',
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30
  });
  
  try {
    console.log('Testing database connection...');
    
    // Test query
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Connection successful!');
    console.log('Current time:', result[0].current_time);
    console.log('PostgreSQL version:', result[0].pg_version);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('\n📋 Tables in database:');
    tables.forEach(t => console.log('  -', t.table_name));
    
    // Count contests
    const contests = await sql`SELECT COUNT(*) as count FROM contests`;
    console.log('\n📊 Total contests:', contests[0].count);
    
    // Count submissions
    const submissions = await sql`SELECT COUNT(*) as count FROM submissions`;
    console.log('📊 Total submissions:', submissions[0].count);
    
    await sql.end();
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();
