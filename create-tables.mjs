import postgres from 'postgres';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read database URL from environment
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.aomjtfhjwsewrgubouma:aura@12345@aws-1-us-east-2.pooler.supabase.com:5432/postgres';

console.log('🔄 Creating users table and contest_participants table...\n');

const sql = postgres(DATABASE_URL);

async function createTables() {
  try {
    console.log('📝 Creating users table...');
    
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE,
        is_active BOOLEAN DEFAULT TRUE
      )
    `;
    console.log('✅ Users table created\n');
    
    console.log('📝 Creating contest_participants table...');
    
    // Create contest_participants table
    await sql`
      CREATE TABLE IF NOT EXISTS contest_participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contest_id TEXT NOT NULL,
        user_id UUID NOT NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(contest_id, user_id)
      )
    `;
    console.log('✅ Contest participants table created\n');
    
    console.log('📝 Creating indexes...');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_participants_contest ON contest_participants(contest_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_participants_user ON contest_participants(user_id)`;
    
    console.log('✅ Indexes created\n');
    
    console.log('📝 Adding foreign key constraints...');
    
    // Add foreign key constraints for contest_participants
    await sql`
      ALTER TABLE contest_participants 
      DROP CONSTRAINT IF EXISTS fk_participants_contest
    `;
    await sql`
      ALTER TABLE contest_participants 
      ADD CONSTRAINT fk_participants_contest 
      FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE
    `;
    
    await sql`
      ALTER TABLE contest_participants 
      DROP CONSTRAINT IF EXISTS fk_participants_user
    `;
    await sql`
      ALTER TABLE contest_participants 
      ADD CONSTRAINT fk_participants_user 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `;
    
    console.log('✅ Foreign key constraints added\n');
    
    console.log('📝 Updating submissions table to use user_id...');
    
    // Check if submissions has user_name column
    const hasUserName = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'submissions' AND column_name = 'user_name'
    `;
    
    if (hasUserName.length > 0) {
      console.log('⚠️  Found user_name column, need to migrate to user_id');
      console.log('   Since we don\'t have existing users, we\'ll drop and recreate submissions table');
      
      await sql`DROP TABLE IF EXISTS submissions CASCADE`;
      
      await sql`
        CREATE TABLE submissions (
          id TEXT PRIMARY KEY,
          contest_id TEXT NOT NULL,
          problem_id TEXT NOT NULL,
          user_id UUID NOT NULL,
          code TEXT NOT NULL,
          language TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          passed_test_cases INTEGER DEFAULT 0,
          total_test_cases INTEGER NOT NULL,
          points INTEGER DEFAULT 0,
          execution_time DECIMAL(10, 3),
          submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      
      // Add indexes for submissions
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_contest ON submissions(contest_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_contest_user ON submissions(contest_id, user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_contest_problem ON submissions(contest_id, problem_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status)`;
      
      // Add foreign keys for submissions
      await sql`
        ALTER TABLE submissions 
        DROP CONSTRAINT IF EXISTS fk_submissions_contest
      `;
      await sql`
        ALTER TABLE submissions 
        ADD CONSTRAINT fk_submissions_contest 
        FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE
      `;
      
      await sql`
        ALTER TABLE submissions 
        DROP CONSTRAINT IF EXISTS fk_submissions_user
      `;
      await sql`
        ALTER TABLE submissions 
        ADD CONSTRAINT fk_submissions_user 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `;
      
      console.log('✅ Submissions table recreated with user_id\n');
    } else {
      console.log('✅ Submissions table already uses user_id\n');
    }
    
    console.log('📝 Creating leaderboard view...');
    
    // Create or replace leaderboard view
    await sql`
      CREATE OR REPLACE VIEW leaderboard_view AS
      SELECT 
        s.contest_id,
        s.user_id,
        u.email,
        u.full_name,
        SUM(s.points) as total_points,
        COUNT(DISTINCT s.problem_id) as solved_problems,
        MAX(s.submitted_at) as last_submission_time
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'accepted'
      GROUP BY s.contest_id, s.user_id, u.email, u.full_name
    `;
    console.log('✅ Leaderboard view created\n');
    
    // Verify all tables
    console.log('🔍 Verifying all tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('📋 Tables in database:');
    tables.forEach(t => console.log(`   - ${t.table_name}`));
    
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    const contestCount = await sql`SELECT COUNT(*) as count FROM contests`;
    const submissionCount = await sql`SELECT COUNT(*) as count FROM submissions`;
    const participantCount = await sql`SELECT COUNT(*) as count FROM contest_participants`;
    
    console.log('\n📊 Current data:');
    console.log(`   - Users: ${userCount[0].count}`);
    console.log(`   - Contests: ${contestCount[0].count}`);
    console.log(`   - Submissions: ${submissionCount[0].count}`);
    console.log(`   - Contest Participants: ${participantCount[0].count}`);
    
    console.log('\n✅ Migration completed successfully!\n');
    console.log('🚀 You can now:');
    console.log('   1. Visit http://localhost:3000');
    console.log('   2. Click "Sign Up" to create an account');
    console.log('   3. Login and join contests via contest codes');
    console.log('   4. Admin login at /admin with username: admin, password: admin123\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

createTables().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
