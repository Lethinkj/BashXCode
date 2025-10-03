// Contest types
export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  testCases: TestCase[];
  timeLimit: number; // in seconds
  memoryLimit: number; // in MB
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  problems: Problem[];
  createdAt: string;
}

export interface Submission {
  id: string;
  contestId: string;
  problemId: string;
  userName: string;
  code: string;
  language: string;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'compile_error' | 'compilation_error' | 'error';
  passedTestCases: number;
  totalTestCases: number;
  points: number;
  submittedAt: string;
  executionTime?: number;
  details?: string;
}

export interface LeaderboardEntry {
  userName: string;
  totalPoints: number;
  solvedProblems: number;
  lastSubmissionTime: string;
  submissions: {
    problemId: string;
    points: number;
    time: string;
  }[];
}

export interface CodeExecutionRequest {
  code: string;
  language: string;
  input: string;
}

export interface CodeExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
}
