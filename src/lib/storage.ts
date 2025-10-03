import { Contest, Submission, LeaderboardEntry } from '@/types';
import postgres from 'postgres';

// Database connection
const sql = postgres(process.env.DATABASE_URL!, {
  ssl: 'require'
});

export const contestStorage = {
  getAll: async (): Promise<Contest[]> => {
    const rows = await sql`
      SELECT * FROM contests 
      ORDER BY created_at DESC
    `;
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      problems: typeof row.problems === 'string' ? JSON.parse(row.problems) : row.problems,
      createdAt: row.created_at
    }));
  },
  
  getById: async (id: string): Promise<Contest | undefined> => {
    const rows = await sql`
      SELECT * FROM contests 
      WHERE id = ${id}
    `;
    if (rows.length === 0) return undefined;
    
    const row = rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      startTime: row.start_time,
      endTime: row.end_time,
      problems: typeof row.problems === 'string' ? JSON.parse(row.problems) : row.problems,
      createdAt: row.created_at
    };
  },
  
  create: async (contest: Contest): Promise<Contest> => {
    await sql`
      INSERT INTO contests (id, title, description, start_time, end_time, problems, created_at)
      VALUES (
        ${contest.id}, 
        ${contest.title}, 
        ${contest.description}, 
        ${contest.startTime}, 
        ${contest.endTime}, 
        ${JSON.stringify(contest.problems)}, 
        ${contest.createdAt}
      )
    `;
    return contest;
  },
  
  update: async (id: string, contest: Partial<Contest>): Promise<Contest | undefined> => {
    const existing = await contestStorage.getById(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...contest };
    await sql`
      UPDATE contests 
      SET 
        title = ${updated.title},
        description = ${updated.description},
        start_time = ${updated.startTime},
        end_time = ${updated.endTime},
        problems = ${JSON.stringify(updated.problems)}
      WHERE id = ${id}
    `;
    return updated;
  },
  
  delete: async (id: string): Promise<boolean> => {
    const result = await sql`
      DELETE FROM contests 
      WHERE id = ${id}
    `;
    return result.length > 0;
  }
};

export const submissionStorage = {
  getAll: async (): Promise<Submission[]> => {
    const rows = await sql`
      SELECT * FROM submissions 
      ORDER BY submitted_at DESC
    `;
    return rows.map(row => ({
      id: row.id,
      contestId: row.contest_id,
      problemId: row.problem_id,
      userName: row.user_name,
      code: row.code,
      language: row.language,
      status: row.status as Submission['status'],
      passedTestCases: row.passed_test_cases,
      totalTestCases: row.total_test_cases,
      points: row.points,
      submittedAt: row.submitted_at,
      executionTime: row.execution_time ? parseFloat(row.execution_time) : undefined
    }));
  },
  
  getByContestId: async (contestId: string): Promise<Submission[]> => {
    const rows = await sql`
      SELECT * FROM submissions 
      WHERE contest_id = ${contestId}
      ORDER BY submitted_at DESC
    `;
    return rows.map(row => ({
      id: row.id,
      contestId: row.contest_id,
      problemId: row.problem_id,
      userName: row.user_name,
      code: row.code,
      language: row.language,
      status: row.status as Submission['status'],
      passedTestCases: row.passed_test_cases,
      totalTestCases: row.total_test_cases,
      points: row.points,
      submittedAt: row.submitted_at,
      executionTime: row.execution_time ? parseFloat(row.execution_time) : undefined
    }));
  },
  
  getByUserAndContest: async (userName: string, contestId: string): Promise<Submission[]> => {
    const rows = await sql`
      SELECT * FROM submissions 
      WHERE user_name = ${userName} AND contest_id = ${contestId}
      ORDER BY submitted_at DESC
    `;
    return rows.map(row => ({
      id: row.id,
      contestId: row.contest_id,
      problemId: row.problem_id,
      userName: row.user_name,
      code: row.code,
      language: row.language,
      status: row.status as Submission['status'],
      passedTestCases: row.passed_test_cases,
      totalTestCases: row.total_test_cases,
      points: row.points,
      submittedAt: row.submitted_at,
      executionTime: row.execution_time ? parseFloat(row.execution_time) : undefined
    }));
  },
  
  create: async (submission: Submission): Promise<Submission> => {
    await sql`
      INSERT INTO submissions (
        id, contest_id, problem_id, user_name, code, language, 
        status, passed_test_cases, total_test_cases, points, 
        execution_time, submitted_at
      )
      VALUES (
        ${submission.id}, 
        ${submission.contestId}, 
        ${submission.problemId}, 
        ${submission.userName}, 
        ${submission.code}, 
        ${submission.language}, 
        ${submission.status}, 
        ${submission.passedTestCases}, 
        ${submission.totalTestCases}, 
        ${submission.points}, 
        ${submission.executionTime || null}, 
        ${submission.submittedAt}
      )
    `;
    return submission;
  },
  
  update: async (id: string, submission: Partial<Submission>): Promise<Submission | undefined> => {
    const rows = await sql`
      SELECT * FROM submissions WHERE id = ${id}
    `;
    
    if (rows.length === 0) return undefined;
    
    const existing = rows[0];
    const updated = {
      status: submission.status ?? existing.status,
      passedTestCases: submission.passedTestCases ?? existing.passed_test_cases,
      points: submission.points ?? existing.points,
      executionTime: submission.executionTime ?? existing.execution_time
    };
    
    await sql`
      UPDATE submissions 
      SET 
        status = ${updated.status},
        passed_test_cases = ${updated.passedTestCases},
        points = ${updated.points},
        execution_time = ${updated.executionTime}
      WHERE id = ${id}
    `;
    
    return {
      id: existing.id,
      contestId: existing.contest_id,
      problemId: existing.problem_id,
      userName: existing.user_name,
      code: existing.code,
      language: existing.language,
      status: updated.status as Submission['status'],
      passedTestCases: updated.passedTestCases,
      totalTestCases: existing.total_test_cases,
      points: updated.points,
      submittedAt: existing.submitted_at,
      executionTime: updated.executionTime ? parseFloat(updated.executionTime) : undefined
    };
  }
};

export const leaderboardService = {
  getLeaderboard: async (contestId: string): Promise<LeaderboardEntry[]> => {
    const rows = await sql`
      WITH best_submissions AS (
        SELECT DISTINCT ON (user_name, problem_id)
          user_name,
          problem_id,
          points,
          submitted_at
        FROM submissions
        WHERE contest_id = ${contestId} 
          AND status = 'accepted'
        ORDER BY user_name, problem_id, submitted_at ASC
      )
      SELECT 
        user_name,
        SUM(points) as total_points,
        COUNT(DISTINCT problem_id) as solved_problems,
        MAX(submitted_at) as last_submission_time,
        json_agg(
          json_build_object(
            'problemId', problem_id,
            'points', points,
            'time', submitted_at
          )
        ) as submissions
      FROM best_submissions
      GROUP BY user_name
      ORDER BY total_points DESC, last_submission_time ASC
    `;
    
    return rows.map(row => ({
      userName: row.user_name,
      totalPoints: parseInt(row.total_points),
      solvedProblems: parseInt(row.solved_problems),
      lastSubmissionTime: row.last_submission_time,
      submissions: row.submissions
    }));
  }
};
