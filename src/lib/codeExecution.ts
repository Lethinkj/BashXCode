import { CodeExecutionRequest, CodeExecutionResult } from '@/types';

// Judge0 Language IDs
// https://ce.judge0.com/languages
const LANGUAGE_IDS: Record<string, number> = {
  python: 71,      // Python 3.8.1
  javascript: 63,  // JavaScript (Node.js 12.14.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  cpp: 54,         // C++ (GCC 9.2.0)
  c: 50,           // C (GCC 9.2.0)
};

/**
 * Execute code using Judge0 API
 * Free tier: 50 executions/day
 * Basic: $10/mo for 1,000/day
 * Pro: $50/mo for 10,000/day
 */
export async function executeCode(
  request: CodeExecutionRequest
): Promise<CodeExecutionResult> {
  const startTime = Date.now();
  
  // Check if Judge0 is configured
  const apiKey = process.env.RAPIDAPI_KEY;
  const apiHost = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
  
  if (!apiKey || apiKey === 'your_rapidapi_key_here') {
    // Return mock execution if not configured
    return mockExecution(request, startTime);
  }
  
  try {
    // Step 1: Submit code for execution
    const submissionResponse = await fetch(`https://${apiHost}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost,
      },
      body: JSON.stringify({
        source_code: btoa(request.code), // Base64 encode
        language_id: LANGUAGE_IDS[request.language] || 71,
        stdin: btoa(request.input || ''),
        cpu_time_limit: 2, // 2 seconds
        memory_limit: 128000, // 128 MB
      }),
    });

    if (!submissionResponse.ok) {
      throw new Error(`Submission failed: ${submissionResponse.statusText}`);
    }

    const submissionData = await submissionResponse.json();
    const token = submissionData.token;

    // Step 2: Poll for result
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      await sleep(1000); // Wait 1 second between polls

      const resultResponse = await fetch(`https://${apiHost}/submissions/${token}?base64_encoded=true`, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': apiHost,
        },
      });

      if (!resultResponse.ok) {
        throw new Error(`Failed to get result: ${resultResponse.statusText}`);
      }

      result = await resultResponse.json();

      // Status IDs: 1=In Queue, 2=Processing, 3=Accepted, 4+=Error
      if (result.status.id > 2) {
        break; // Completed
      }

      attempts++;
    }

    if (!result || result.status.id <= 2) {
      throw new Error('Execution timeout');
    }

    const executionTime = Date.now() - startTime;

    // Decode output
    const stdout = result.stdout ? atob(result.stdout) : '';
    const stderr = result.stderr ? atob(result.stderr) : '';
    const compileOutput = result.compile_output ? atob(result.compile_output) : '';

    // Check status
    if (result.status.id === 3) {
      // Accepted
      return {
        output: stdout,
        executionTime,
      };
    } else if (result.status.id === 6) {
      // Compilation Error
      return {
        output: '',
        error: `Compilation Error:\n${compileOutput}`,
        executionTime,
      };
    } else if (result.status.id === 5) {
      // Time Limit Exceeded
      return {
        output: stdout,
        error: 'Time Limit Exceeded',
        executionTime,
      };
    } else if (result.status.id === 11 || result.status.id === 12) {
      // Runtime Error
      return {
        output: stdout,
        error: `Runtime Error:\n${stderr}`,
        executionTime,
      };
    } else {
      // Other errors
      return {
        output: stdout,
        error: stderr || result.status.description || 'Unknown error',
        executionTime,
      };
    }
  } catch (error: any) {
    return {
      output: '',
      error: error.message || 'Execution failed',
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Mock execution for when Judge0 is not configured
 */
function mockExecution(request: CodeExecutionRequest, startTime: number): CodeExecutionResult {
  return {
    output: '⚠️ Judge0 API not configured\n\nTo enable real code execution:\n1. Sign up at https://rapidapi.com/judge0-official/api/judge0-ce\n2. Get your API key\n3. Add to .env.local:\n   RAPIDAPI_KEY=your_key_here\n4. Restart the server\n\nYour code would run here with real test cases!',
    executionTime: Date.now() - startTime,
  };
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function executeCodeWithTestCases(
  code: string,
  language: string,
  testCases: Array<{ input: string; expectedOutput: string }>
): Promise<{
  passed: number;
  total: number;
  results: Array<{ passed: boolean; output: string; expected: string; error?: string }>;
}> {
  const results = [];
  let passed = 0;
  
  for (const testCase of testCases) {
    const result = await executeCode({
      code,
      language,
      input: testCase.input
    });
    
    const output = result.output.trim();
    const expected = testCase.expectedOutput.trim();
    const testPassed = !result.error && output === expected;
    
    if (testPassed) passed++;
    
    results.push({
      passed: testPassed,
      output,
      expected,
      error: result.error
    });
  }
  
  return {
    passed,
    total: testCases.length,
    results
  };
}
