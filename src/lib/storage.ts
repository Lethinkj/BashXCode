import { Contest, Submission, LeaderboardEntry } from '@/types';
import sql, { queryWithRetry } from './db';

export const contestStorage = {
  getAll: async (): Promise<Contest[]> => {
    const rows = await queryWithRetry(async (db) => await db`
      SELECT * FROM contests 
      ORDER BY created_at DESC
    `);
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      contestCode: row.contest_code,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status as Contest['status'],
      problems: typeof row.problems === 'string' ? JSON.parse(row.problems) : row.problems,
      createdBy: row.created_by || 'admin',
      createdAt: row.created_at
    }));
  },
  
  getById: async (id: string): Promise<Contest | undefined> => {
    const rows = await queryWithRetry(async (db) => await db`
      SELECT * FROM contests 
      WHERE id = ${id}
    `);
    if (rows.length === 0) return undefined;
    
    const row: any = rows[0];
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      contestCode: row.contest_code,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status as Contest['status'],
      problems: typeof row.problems === 'string' ? JSON.parse(row.problems) : row.problems,
      createdBy: row.created_by || 'admin',
      createdAt: row.created_at
    };
  },

  getUserContests: async (userId: string): Promise<Contest[]> => {
    const rows = await sql`
      SELECT c.* FROM contests c
      INNER JOIN contest_participants cp ON c.id = cp.contest_id
      WHERE cp.user_id = ${userId}
      ORDER BY c.created_at DESC
    `;
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      contestCode: row.contest_code,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status as Contest['status'],
      problems: typeof row.problems === 'string' ? JSON.parse(row.problems) : row.problems,
      createdBy: row.created_by || 'admin',
      createdAt: row.created_at
    }));
  },
  
  create: async (contest: Contest): Promise<Contest> => {
    await sql`
      INSERT INTO contests (id, title, description, contest_code, start_time, end_time, status, problems, created_by, created_at)
      VALUES (
        ${contest.id}, 
        ${contest.title}, 
        ${contest.description}, 
        ${contest.contestCode},
        ${contest.startTime}, 
        ${contest.endTime}, 
        ${contest.status},
        ${JSON.stringify(contest.problems)}, 
        ${contest.createdBy},
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
        contest_code = ${updated.contestCode},
        start_time = ${updated.startTime},
        end_time = ${updated.endTime},
        status = ${updated.status},
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
    return result.count > 0;
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
      userId: row.user_id,
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
      userId: row.user_id,
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
  
  getByUserAndContest: async (userId: string, contestId: string): Promise<Submission[]> => {
    const rows = await sql`
      SELECT * FROM submissions 
      WHERE user_id = ${userId} AND contest_id = ${contestId}
      ORDER BY submitted_at DESC
    `;
    return rows.map(row => ({
      id: row.id,
      contestId: row.contest_id,
      problemId: row.problem_id,
      userId: row.user_id,
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
        id, contest_id, problem_id, user_id, code, language, 
        status, passed_test_cases, total_test_cases, points, 
        execution_time, submitted_at
      )
      VALUES (
        ${submission.id}, 
        ${submission.contestId}, 
        ${submission.problemId}, 
        ${submission.userId}, 
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
      userId: existing.user_id,
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
        SELECT DISTINCT ON (user_id, problem_id)
          user_id,
          problem_id,
          points,
          submitted_at
        FROM submissions
        WHERE contest_id = ${contestId} 
          AND status = 'accepted'
        ORDER BY user_id, problem_id, submitted_at ASC
      )
      SELECT 
        bs.user_id,
        u.email,
        u.full_name,
        SUM(bs.points) as total_points,
        COUNT(DISTINCT bs.problem_id) as solved_problems,
        MAX(bs.submitted_at) as last_submission_time,
        json_agg(
          json_build_object(
            'problemId', bs.problem_id,
            'points', bs.points,
            'time', bs.submitted_at
          )
        ) as submissions
      FROM best_submissions bs
      JOIN users u ON bs.user_id = u.id
      GROUP BY bs.user_id, u.email, u.full_name
      ORDER BY total_points DESC, last_submission_time ASC
    `;
    
    return rows.map(row => ({
      userId: row.user_id,
      email: row.email,
      fullName: row.full_name,
      totalPoints: parseInt(row.total_points),
      solvedProblems: parseInt(row.solved_problems),
      lastSubmissionTime: row.last_submission_time,
      submissions: row.submissions
    }));
  }
};
