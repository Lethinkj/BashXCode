'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contest, Problem, Submission } from '@/types';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function ContestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [contestId, setContestId] = useState<string>('');
  const [contest, setContest] = useState<Contest | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [userName, setUserName] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');

  useEffect(() => {
    params.then(({ id }) => {
      setContestId(id);
      const name = localStorage.getItem('userName');
      if (!name) {
        router.push('/');
        return;
      }
      setUserName(name);
    });
  }, []);

  useEffect(() => {
    if (contestId) {
      fetchContest();
    }
  }, [contestId]);

  useEffect(() => {
    if (selectedProblem) {
      fetchSubmissions();
    }
  }, [selectedProblem]);

  const fetchContest = async () => {
    const response = await fetch(`/api/contests/${contestId}`);
    const data = await response.json();
    setContest(data);
    if (data.problems.length > 0) {
      setSelectedProblem(data.problems[0]);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedProblem || !contestId) return;
    const response = await fetch(
      `/api/submissions?contestId=${contestId}&userName=${userName}`
    );
    const data = await response.json();
    setSubmissions(data.filter((s: Submission) => s.problemId === selectedProblem.id));
  };

  const handleSubmit = async () => {
    if (!selectedProblem || !contestId) return;

    if (!code.trim()) {
      alert('Please write some code before submitting!');
      return;
    }

    const confirmed = confirm(
      `Submit your solution for "${selectedProblem.title}"?\n\n` +
      `Your code will be tested against ${selectedProblem.testCases.length} test cases.\n` +
      `You will earn ${selectedProblem.points} points only if ALL test cases pass.`
    );

    if (!confirmed) return;

    const submission = {
      contestId: contestId,
      problemId: selectedProblem.id,
      userName,
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

  const handleRunCode = async () => {
    if (!code.trim()) {
      setTestOutput('Error: Please write some code first!');
      return;
    }

    setTestOutput('Running code...');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: testInput }),
      });

      const result = await response.json();
      
      if (result.error) {
        setTestOutput(`❌ Error:\n${result.error}\n\nExecution Time: ${result.executionTime}ms`);
      } else {
        setTestOutput(`✅ Success:\n${result.output}\n\nExecution Time: ${result.executionTime}ms`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/contests" className="text-xl font-bold text-primary-600">
              {contest.title}
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {userName}</span>
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
            <div className="flex gap-2">
              <button
                onClick={handleRunCode}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Run Code
              </button>
              <button
                onClick={handleSubmit}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Submit
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
