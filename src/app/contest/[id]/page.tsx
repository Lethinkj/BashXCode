'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contest, Problem, Submission } from '@/types';
import { getAuthToken, isContestActive, hasContestStarted, hasContestEnded, getTimeRemaining } from '@/lib/auth';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ContestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [contestId, setContestId] = useState<string>('');
  const [contest, setContest] = useState<Contest | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [testingAllCases, setTestingAllCases] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setContestId(id);
      const user = getAuthToken();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email);
    });
  }, [params, router]);

  useEffect(() => {
    if (contestId) {
      fetchContest();
    }
  }, [contestId, fetchContest]);

  useEffect(() => {
    if (selectedProblem) {
      fetchSubmissions();
    }
  }, [selectedProblem, fetchSubmissions]);

  // Countdown timer for contest start
  useEffect(() => {
    if (!contest) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const diff = start.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilStart('');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let countdown = '';
      if (days > 0) countdown += `${days}d `;
      if (hours > 0) countdown += `${hours}h `;
      if (minutes > 0) countdown += `${minutes}m `;
      countdown += `${seconds}s`;

      setTimeUntilStart(countdown);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [contest]);

  const fetchContest = useCallback(async () => {
    const response = await fetch(`/api/contests/${contestId}`);
    const data = await response.json();
    setContest(data);
    if (data.problems.length > 0) {
      setSelectedProblem(data.problems[0]);
    }
  }, [contestId]);

  const fetchSubmissions = useCallback(async () => {
    if (!selectedProblem || !contestId || !userId) return;
    const response = await fetch(
      `/api/submissions?contestId=${contestId}&userId=${userId}`
    );
    const data = await response.json();
    const problemSubs = data.filter((s: Submission) => s.problemId === selectedProblem.id);
    setSubmissions(problemSubs);
    
    // Check if all tests passed in the latest submission
    if (problemSubs.length > 0) {
      const latest = problemSubs[problemSubs.length - 1];
      setAllTestsPassed(latest.status === 'accepted' && latest.passedTestCases === latest.totalTestCases);
    } else {
      setAllTestsPassed(false);
    }
  }, [selectedProblem, contestId, userId]);

  const handleSubmit = async () => {
    if (!selectedProblem || !contestId) return;

    if (!code.trim()) {
      alert('Please write some code before submitting!');
      return;
    }

    // Submit solution
    const confirmed = confirm(
      `Submit your solution for "${selectedProblem.title}"?\n\n` +
      `Your code will be tested against ${selectedProblem.testCases.length} test cases.\n` +
      `You will earn ${selectedProblem.points} points only if ALL test cases pass.`
    );

    if (!confirmed) return;

    const submission = {
      contestId: contestId,
      problemId: selectedProblem.id,
      userId,
      code,
      language,
    };

    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });

    if (response.ok) {
      const result = await response.json();
      alert(
        `Code submitted successfully!\n\n` +
        `Submission ID: ${result.id}\n` +
        `Status: Evaluating...\n\n` +
        `Please wait a few seconds and check your submissions below for results.`
      );
      // Wait 3 seconds then refresh submissions
      setTimeout(() => {
        fetchSubmissions();
      }, 3000);
    } else {
      const error = await response.json();
      alert(`Submission failed: ${error.error || 'Unknown error'}`);
    }
  };

  const handleTestAllCases = async () => {
    if (!selectedProblem || !code.trim()) {
      alert('Please write some code first!');
      return;
    }

    setTestingAllCases(true);
    setTestOutput('🧪 Testing against all test cases...');

    try {
      const results = [];
      let allPassed = true;

      for (let i = 0; i < selectedProblem.testCases.length; i++) {
        const testCase = selectedProblem.testCases[i];
        let result;

        // Try browser execution first for JS/Python
        if (language === 'javascript' || language === 'python') {
          try {
            const { executeInBrowser } = await import('@/lib/clientExecution');
            result = await executeInBrowser(code, language, testCase.input);
          } catch (error) {
            // Fall back to API
            const response = await fetch('/api/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code, language, input: testCase.input }),
            });
            result = await response.json();
          }
        } else {
          // Use API for compiled languages
          const response = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language, input: testCase.input }),
          });
          result = await response.json();
        }

        const passed = !result.error && result.output?.trim() === testCase.expectedOutput.trim();
        results.push({
          testCase: i + 1,
          passed,
          expected: testCase.expectedOutput,
          actual: result.output || '',
          error: result.error
        });

        if (!passed) allPassed = false;
      }

      // Update test status
      setAllTestsPassed(allPassed);

      // Display results
      const passedCount = results.filter(r => r.passed).length;
      const totalCount = results.length;
      
      let output = `Test Results: ${passedCount}/${totalCount} passed\n\n`;
      
      results.forEach((r, idx) => {
        if (r.passed) {
          output += `✅ Test Case ${r.testCase}: PASSED\n`;
        } else {
          output += `❌ Test Case ${r.testCase}: FAILED\n`;
          if (r.error) {
            output += `   Error: ${r.error}\n`;
          } else {
            output += `   Expected: ${r.expected}\n`;
            output += `   Got: ${r.actual}\n`;
          }
        }
      });

      if (allPassed) {
        output += `\n🎉 All test cases passed! You can now submit.`;
      } else {
        output += `\n⚠️ Some test cases failed. Fix your code and test again.`;
      }

      setTestOutput(output);
    } catch (error: any) {
      setTestOutput(`❌ Testing Error: ${error.message}`);
      setAllTestsPassed(false);
    } finally {
      setTestingAllCases(false);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      setTestOutput('Error: Please write some code first!');
      return;
    }

    // Try client-side execution first (instant for JS/Python)
    if (language === 'javascript' || language === 'python') {
      setTestOutput('⚡ Running in browser...');
      
      try {
        const { executeInBrowser } = await import('@/lib/clientExecution');
        const result = await executeInBrowser(code, language, testInput);
        
        if (result) {
          if (result.error) {
            setTestOutput(`❌ Error:\n${result.error}\n\n⚡ Execution Time: ${result.executionTime}ms (Browser)`);
          } else {
            setTestOutput(`✅ Success:\n${result.output}\n\n⚡ Execution Time: ${result.executionTime}ms (Browser)`);
          }
          return;
        }
      } catch (error: any) {
        console.error('Browser execution failed, falling back to API:', error);
      }
    }

    // Fall back to API for compiled languages or if browser execution fails
    setTestOutput('🌐 Running via API...');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: testInput }),
      });

      const result = await response.json();
      
      if (result.error) {
        setTestOutput(`❌ Error:\n${result.error}\n\n🌐 Execution Time: ${result.executionTime}ms (API)`);
      } else {
        setTestOutput(`✅ Success:\n${result.output}\n\n🌐 Execution Time: ${result.executionTime}ms (API)`);
      }
    } catch (error: any) {
      setTestOutput(`❌ Network Error:\n${error.message || 'Failed to execute code'}`);
    }
  };

  const getLanguageTemplate = (lang: string) => {
    const templates: Record<string, string> = {
      python: `# Write your solution here
def solve():
    n = int(input())
    print(n)

solve()`,
      javascript: `// Write your solution here
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    console.log(input);
    rl.close();
});`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(n);
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    cout << n << endl;
    return 0;
}`,
      c: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\\n", n);
    return 0;
}`,
    };
    return templates[lang] || '';
  };

  useEffect(() => {
    setCode(getLanguageTemplate(language));
  }, [language]);

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if contest has ended
  if (new Date() > new Date(contest.endTime)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="inline-block p-6 bg-red-100 rounded-full mb-4">
              <svg className="w-20 h-20 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">{contest.title}</h1>
            <p className="text-2xl text-red-600 font-semibold mb-6">Contest Has Ended</p>
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-gray-600 mb-2">Contest ended at:</p>
              <p className="text-xl font-semibold text-gray-800">
                {new Date(contest.endTime).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'long'
                })}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link 
                href={`/contest/${contestId}/leaderboard`}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                View Leaderboard
              </Link>
              <Link 
                href="/join"
                className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Back to Contests
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if contest hasn't started yet
  if (new Date() < new Date(contest.startTime)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="inline-block p-6 bg-blue-100 rounded-full mb-4 animate-pulse">
              <svg className="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">{contest.title}</h1>
            <p className="text-2xl text-blue-600 font-semibold mb-6">Contest Starts Soon!</p>
            <div className="bg-blue-50 rounded-xl p-8 mb-6">
              <p className="text-gray-600 mb-4 text-lg">Contest begins in:</p>
              <div className="text-5xl font-bold text-blue-600 mb-6 font-mono">
                {timeUntilStart || 'Starting...'}
              </div>
              <div className="border-t-2 border-blue-200 pt-6 mt-6">
                <p className="text-gray-600 mb-2">Start time:</p>
                <p className="text-xl font-semibold text-gray-800">
                  {new Date(contest.startTime).toLocaleString('en-US', {
                    dateStyle: 'full',
                    timeStyle: 'long'
                  })}
                </p>
              </div>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <span className="font-semibold">📌 Tip:</span> Stay on this page. You&apos;ll be automatically redirected when the contest starts!
              </p>
            </div>
            <Link 
              href="/join"
              className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold inline-block"
            >
              Back to Contests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/join" className="text-xl font-bold text-primary-600">
              {contest.title}
            </Link>
            <div className="flex items-center gap-4">
              {contest && (
                <div className="text-sm">
                  {isContestActive(contest.startTime, contest.endTime) ? (
                    <span className="text-green-600 font-semibold">⏰ {getTimeRemaining(contest.endTime)} remaining</span>
                  ) : hasContestEnded(contest.endTime) ? (
                    <span className="text-gray-500">Contest Ended</span>
                  ) : (
                    <span className="text-blue-600">Starts: {new Date(contest.startTime).toLocaleString()}</span>
                  )}
                </div>
              )}
              <span className="text-gray-700">{userEmail}</span>
              <Link
                href={`/contest/${contestId}/leaderboard`}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Problems Sidebar */}
        <div className="w-64 bg-white shadow-lg overflow-y-auto">
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Problems</h3>
            {contest.problems.map((problem) => {
              const userSubmissions = submissions.filter(s => s.problemId === problem.id);
              const solved = userSubmissions.some(s => s.status === 'accepted');
              
              return (
                <button
                  key={problem.id}
                  onClick={() => setSelectedProblem(problem)}
                  className={`w-full text-left p-3 mb-2 rounded-lg transition ${
                    selectedProblem?.id === problem.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{problem.title}</span>
                    {solved && <span className="text-green-500">✓</span>}
                  </div>
                  <div className="text-sm mt-1 opacity-75">{problem.points} points</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Problem Description */}
        <div className="w-1/3 bg-white border-r overflow-y-auto p-6">
          {selectedProblem && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedProblem.title}</h2>
              <div className="flex gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  selectedProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  selectedProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedProblem.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {selectedProblem.points} points
                </span>
              </div>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{selectedProblem.description}</p>
              </div>
              
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Sample Test Case</h3>
                {selectedProblem.testCases.slice(0, 1).map((tc, idx) => (
                  <div key={tc.id} className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900">Example</p>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Input:</p>
                      <pre className="bg-white p-2 rounded border text-gray-900">{tc.input}</pre>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Expected Output:</p>
                      <pre className="bg-white p-2 rounded border text-gray-900">{tc.expectedOutput}</pre>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-gray-500 italic mt-2">Note: Your solution will be tested against {selectedProblem.testCases.length} hidden test cases. All must pass to get full points.</p>
              </div>

              {/* Submissions History */}
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2 text-gray-900">Your Submissions</h3>
                {submissions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No submissions yet. Submit your code to see results here.</p>
                ) : (
                  <div className="space-y-2">
                    {submissions.slice().reverse().map((sub) => (
                      <div key={sub.id} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            sub.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            sub.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            sub.status === 'compilation_error' || sub.status === 'compile_error' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {sub.status === 'accepted' ? '✓ Accepted' :
                             sub.status === 'running' ? '⟳ Running' :
                             sub.status === 'compilation_error' || sub.status === 'compile_error' ? '⚠ Compilation Error' :
                             sub.status === 'runtime_error' ? '✗ Runtime Error' :
                             sub.status === 'wrong_answer' ? '✗ Wrong Answer' :
                             sub.status === 'time_limit' ? '⏱ Time Limit' : '✗ Error'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(sub.submittedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Test Cases:</span> {sub.passedTestCases}/{sub.totalTestCases} passed
                        </div>
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Points:</span> {sub.points}/{selectedProblem.points}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {sub.language.toUpperCase()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-900"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
              <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
                {language === 'javascript' || language === 'python' ? '⚡ Instant' : '🌐 API'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Run Code
              </button>
              <button
                onClick={handleTestAllCases}
                disabled={testingAllCases}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {testingAllCases ? 'Testing...' : 'Test All Cases'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allTestsPassed || !contest || !isContestActive(contest.startTime, contest.endTime)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                title={
                  !allTestsPassed
                    ? 'Click "Test All Cases" first and pass all tests'
                    : !contest || !isContestActive(contest.startTime, contest.endTime)
                    ? 'Contest is not active'
                    : 'Submit your solution'
                }
              >
                Submit {!allTestsPassed && '(Test all first)'}
              </button>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="60%"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
            
            <div className="h-[40%] border-t">
              <div className="grid grid-cols-2 gap-4 p-4 h-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Test Input</label>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="w-full h-[calc(100%-2rem)] border rounded-lg p-2 font-mono text-sm text-gray-900"
                    placeholder="Enter test input here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output</label>
                  <pre className="w-full h-[calc(100%-2rem)] border rounded-lg p-2 font-mono text-sm bg-gray-50 overflow-auto text-gray-900">
                    {testOutput || 'Output will appear here...'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
