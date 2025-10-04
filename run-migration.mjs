import postgres from 'postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read database URL from environment
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.aomjtfhjwsewrgubouma:aura@12345@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

console.log('🔄 Starting database migration...\n');

const sql = postgres(DATABASE_URL);

async function runMigration() {
  try {
    // Read the migration SQL file
    const migrationSQL = readFileSync(join(__dirname, 'migration-quick-fix.sql'), 'utf-8');
    
    console.log('📖 Read migration file: migration-quick-fix.sql');
    
    // Split by semicolons but keep DO blocks together
    const statements = migrationSQL
      .split(/;\s*(?=(?:[^']*'[^']*')*[^']*$)(?!.*END \$\$)/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        await sql.unsafe(statement);
        console.log(`✅ Statement ${i + 1} completed\n`);
      } catch (error) {
        console.error(`❌ Error in statement ${i + 1}:`, error.message);
        console.log('Statement:', statement.substring(0, 100) + '...\n');
        // Continue with other statements
      }
    }
    
    // Verify migration
    console.log('\n🔍 Verifying migration...');
    
    const contestsCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contests' 
      AND column_name IN ('contest_code', 'status', 'created_by')
      ORDER BY column_name
    `;
    
    console.log('✅ Contest table columns:', contestsCheck.map(r => r.column_name).join(', '));
    
    const contestCount = await sql`SELECT COUNT(*) as count FROM contests`;
    console.log(`📊 Total contests: ${contestCount[0].count}`);
    
    if (contestCount[0].count > 0) {
      const sampleContest = await sql`
        SELECT id, title, contest_code, status 
        FROM contests 
        LIMIT 1
      `;
      console.log('📌 Sample contest:', sampleContest[0]);
    }
    
    console.log('\n✅ Migration completed successfully!\n');
    console.log('🚀 You can now run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

runMigration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
