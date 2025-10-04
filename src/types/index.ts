// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

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
  contestCode: string; // NEW: Join code
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended'; // NEW
  problems: Problem[];
  createdBy: string;
  createdAt: string;
}

export interface ContestParticipant {
  id: string;
  contestId: string;
  userId: string;
  joinedAt: string;
}

export interface Submission {
  id: string;
  contestId: string;
  problemId: string;
  userId: string; // CHANGED: from userName to userId
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
  userId: string;
  email: string;
  fullName: string;
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
