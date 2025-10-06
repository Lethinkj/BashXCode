'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Contest, Problem, Submission } from '@/types';
import { getAuthToken, isContestActive, hasContestStarted, hasContestEnded, getTimeRemaining } from '@/lib/auth';
import { generateTemplate, getInputFormatDescription } from '@/lib/codeTemplates';
import dynamic from 'next/dynamic';
import Logo from '@/components/Logo';

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
  const [userName, setUserName] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [testingAllCases, setTestingAllCases] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState<string>('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'warning' | 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'warning',
    title: '',
    message: ''
  });
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showProblemDescription, setShowProblemDescription] = useState(false);
  const [codingStartTime, setCodingStartTime] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Define fetch functions before useEffect hooks
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
      setUserName(user.fullName);
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

    let hasStarted = false;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const diff = start.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilStart('');
        
        // Show notification when contest just started
        if (!hasStarted && isContestActive(contest.startTime, contest.endTime)) {
          hasStarted = true;
          setNotification({
            show: true,
            type: 'success',
            title: '🎉 Contest Started!',
            message: 'Click on the code editor to enter full-screen mode and start coding. Stay in full-screen to avoid violations!'
          });
          setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 8000);
        }
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

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched away from tab
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          // Log tab switch for admin monitoring
          if (contestId && userId) {
            fetch('/api/log-tab-switch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contestId,
                userId,
                userEmail,
                userName,
                timestamp: new Date().toISOString(),
                switchCount: newCount
              }),
            }).catch(err => console.error('Failed to log tab switch:', err));
          }
          return newCount;
        });
        
        // Show tab switch warning notification
        setNotification({
          show: true,
          type: 'warning',
          title: '⚠️ Tab Switch Detected!',
          message: 'Warning: You switched away from this tab. This action is being monitored by the admin.'
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestId, userId, userEmail]);

  // Fullscreen exit detection (no auto-enter to avoid permissions error)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      // If user exits fullscreen during active contest, treat as tab switch
      if (!isCurrentlyFullscreen && contest && isContestActive(contest.startTime, contest.endTime) && contestId && userId) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          // Log as tab switch
          fetch('/api/log-tab-switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contestId,
              userId,
              userEmail,
              userName,
              timestamp: new Date().toISOString(),
              switchCount: newCount
            }),
          }).catch(err => console.error('Failed to log fullscreen exit:', err));
          return newCount;
        });
        
        // Show warning
        setNotification({
          show: true,
          type: 'warning',
          title: '⚠️ Fullscreen Exit Detected!',
          message: 'Warning: You exited fullscreen mode. Click the editor to re-enter fullscreen.'
        });
        setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contest, contestId, userId, userEmail, userName]);

  // Template generation function
  const getLanguageTemplate = useCallback((lang: string, problem?: Problem | null) => {
    // If we have a problem with test cases, generate smart template based on input pattern
    if (problem && problem.testCases && problem.testCases.length > 0) {
      return generateTemplate(lang, problem.testCases);
    }
    
    // Fallback to basic templates if no test cases available
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
  }, []);

  // Track when user starts coding
  useEffect(() => {
    if (code && !codingStartTime && code !== getLanguageTemplate(language, selectedProblem)) {
      const startTime = new Date().toISOString();
      setCodingStartTime(startTime);
      
      // Log coding start time to backend
      if (contestId && userId && selectedProblem) {
        fetch('/api/log-coding-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contestId,
            userId,
            problemId: selectedProblem.id,
            startTime
          }),
        }).catch(err => console.error('Failed to log coding start:', err));
      }
    }
  }, [code, codingStartTime, language, contestId, userId, selectedProblem, getLanguageTemplate]);


  const handleSubmit = async () => {
    if (!selectedProblem || !contestId) return;

    if (!code.trim()) {
      setNotification({
        show: true,
        type: 'warning',
        title: '⚠️ No Code',
        message: 'Please write some code before submitting!'
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
      return;
    }

    // Clear any existing notifications before submitting
    setNotification(prev => ({ ...prev, show: false }));

    // Show submitting notification
    setNotification({
      show: true,
      type: 'warning',
      title: '⏳ Submitting...',
      message: `Testing your solution for "${selectedProblem.title}" against ${selectedProblem.testCases.length} test cases...`
    });

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
      
      // Poll for submission results with retry logic
      const checkSubmissionResult = async (attemptCount = 0): Promise<void> => {
        const maxAttempts = 5;
        const delayMs = 1000; // Check every 1 second
        
        try {
          await fetchSubmissions();
          
          // Fetch the specific submission
          const submissionsResponse = await fetch(
            `/api/submissions?contestId=${contestId}&userId=${userId}`
          );
          const allSubs = await submissionsResponse.json();
          const latestSub = allSubs.find((s: Submission) => s.id === result.id);
          
          if (!latestSub) {
            throw new Error('Submission not found');
          }
          
          // If still running and we haven't exceeded max attempts, retry
          if (latestSub.status === 'running' && attemptCount < maxAttempts) {
            setTimeout(() => checkSubmissionResult(attemptCount + 1), delayMs);
            return;
          }
          
          // Update the notification with final result
          if (latestSub.status === 'accepted' && latestSub.passedTestCases === latestSub.totalTestCases) {
            // All tests passed! Show points notification
            setNotification({
              show: true,
              type: 'success',
              title: '✅ All Tests Passed!',
              message: `Congratulations! You earned ${selectedProblem.points} points for solving "${selectedProblem.title}"! 🎊`
            });
            
            // Auto-hide after 8 seconds
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 8000);
          } else if (latestSub.status === 'running') {
            // Still running after max attempts
            setNotification({
              show: true,
              type: 'warning',
              title: '⏳ Still Processing',
              message: 'Your submission is taking longer than expected. Please refresh the page in a moment.'
            });
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 6000);
          } else {
            // Some tests failed or error occurred
            const passedCount = latestSub.passedTestCases || 0;
            const totalCount = latestSub.totalTestCases || selectedProblem.testCases.length;
            
            setNotification({
              show: true,
              type: 'error',
              title: '❌ Some Tests Failed',
              message: `Your submission passed ${passedCount}/${totalCount} test cases. Keep trying!`
            });
            
            // Auto-hide after 6 seconds
            setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 6000);
          }
        } catch (error) {
          console.error('Error checking submission result:', error);
          setNotification({
            show: true,
            type: 'error',
            title: '❌ Error',
            message: 'Could not retrieve submission results. Please refresh the page.'
          });
          setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
        }
      };
      
      // Start checking after 2 seconds (give backend time to start processing)
      setTimeout(() => checkSubmissionResult(), 2000);
    } else {
      const error = await response.json();
      setNotification({
        show: true,
        type: 'error',
        title: '❌ Submission Failed',
        message: error.error || 'Unknown error occurred. Please try again.'
      });
      
      // Auto-hide after 5 seconds
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
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
        
        // Use API for all languages (full API mode for consistency)
        const response = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, input: testCase.input }),
        });
        const result = await response.json();

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

    // Use API for all languages (consistent execution)
    setTestOutput('🌐 Running via API...');

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: testInput }),
      });

      const result = await response.json();
      
      if (result.error) {
        setTestOutput(`❌ Error:\n${result.error}\n\n🌐 Execution Time: ${result.executionTime}ms`);
      } else {
        setTestOutput(`✅ Success:\n${result.output}\n\n🌐 Execution Time: ${result.executionTime}ms`);
      }
    } catch (error: any) {
      setTestOutput(`❌ Network Error:\n${error.message || 'Failed to execute code'}`);
    }
  };

  useEffect(() => {
    setCode(getLanguageTemplate(language, selectedProblem));
  }, [language, selectedProblem, getLanguageTemplate]);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
      {/* Notification Popup */}
      {notification.show && (
        <div className={`fixed top-20 right-4 left-4 sm:left-auto sm:w-96 z-50 ${
          notification.type === 'warning' ? 'bg-red-500' :
          notification.type === 'success' ? 'bg-green-500' :
          'bg-red-600'
        } text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in-right`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">
              {notification.type === 'warning' ? '⚠️' :
               notification.type === 'success' ? '✅' : '❌'}
            </span>
            <div className="flex-1">
              <p className="font-bold text-lg">{notification.title}</p>
              <p className="text-sm mt-1">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="text-white hover:text-gray-200 flex-shrink-0 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}


      
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/join" className="flex items-center gap-2 sm:gap-3">
              <Logo size="sm" noLink />
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {contest && (
                <div className="text-xs sm:text-sm hidden md:block">
                  {isContestActive(contest.startTime, contest.endTime) ? (
                    <span className="text-green-400 font-semibold">⏰ {getTimeRemaining(contest.endTime)} remaining</span>
                  ) : hasContestEnded(contest.endTime) ? (
                    <span className="text-gray-400">Contest Ended</span>
                  ) : (
                    <span className="text-blue-400">Starts: {new Date(contest.startTime).toLocaleString()}</span>
                  )}
                </div>
              )}
              <span className="text-gray-200 text-xs sm:text-sm hidden lg:inline truncate max-w-[150px]">{userEmail}</span>
              <Link
                href="/profile"
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors hidden sm:inline-block"
              >
                Profile
              </Link>
              <Link
                href={`/contest/${contestId}/leaderboard`}
                className="bg-primary-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg hover:bg-primary-700 font-semibold"
              >
                <span className="hidden sm:inline">🏆 Leaderboard</span>
                <span className="sm:hidden">🏆</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="lg:hidden fixed bottom-4 left-4 z-50 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Overlay */}
        {showMobileSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Problems Sidebar */}
        <div className={`
          fixed lg:relative inset-y-0 left-0 z-40
          w-80 lg:w-64 xl:w-72 
          bg-white shadow-lg overflow-y-auto border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">📝 Problems</h3>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-4">
            {contest && Array.isArray(contest.problems) && contest.problems.map((problem) => {
              const userSubmissions = submissions.filter(s => s.problemId === problem.id);
              const solved = userSubmissions.some(s => s.status === 'accepted');
              
              return (
                <button
                  key={problem.id}
                  onClick={() => {
                    setSelectedProblem(problem);
                    setShowMobileSidebar(false);
                    setShowProblemDescription(false);
                    // Reset code and coding start time when switching problems
                    setCode(getLanguageTemplate(language, problem));
                    setCodingStartTime(null);
                    setTestInput('');
                    setTestOutput('');
                    setAllTestsPassed(false);
                    // Fetch submissions for this problem
                    fetchSubmissions();
                  }}
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
            
            {/* Submissions Section in Sidebar */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-3 text-gray-900">📊 Submissions</h3>
              {submissions.length === 0 ? (
                <p className="text-gray-500 text-sm">No submissions yet</p>
              ) : (
                <div className="space-y-2">
                  {submissions.slice().reverse().slice(0, 5).map((sub) => (
                    <div key={sub.id} className="bg-gray-50 p-2 rounded-lg border text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          sub.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          sub.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sub.status === 'accepted' ? '✓' : sub.status === 'running' ? '⟳' : '✗'}
                        </span>
                        <span className="text-gray-500">
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-gray-700">
                        {sub.passedTestCases}/{sub.totalTestCases} • {sub.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Problem Description Modal for Mobile */}
        {showProblemDescription && (
          <>
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowProblemDescription(false)}
            />
            <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-white overflow-y-auto">
              <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-gray-900">Problem Description</h3>
                  <button
                    onClick={() => setShowProblemDescription(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-4">
                {selectedProblem && (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedProblem.title}</h2>
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
                    
                    {/* Input Format Guide */}
                    <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <h3 className="font-semibold text-blue-900 mb-2">📥 Input Format</h3>
                      <p className="text-sm text-blue-800">
                        {getInputFormatDescription(selectedProblem.testCases)}
                      </p>
                      <p className="text-xs text-blue-700 mt-2 italic">
                        💡 Tip: Your starter code template is already configured to read this format correctly!
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-bold text-lg mb-2 text-gray-900">Sample Test Case</h3>
                      {selectedProblem.testCases.slice(0, 1).map((tc) => (
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
                      <p className="text-sm text-gray-500 italic mt-2">
                        Note: Your solution will be tested against {selectedProblem.testCases.length} hidden test cases.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Problem Description - Desktop Only */}
        <div className="hidden lg:block lg:w-1/3 xl:w-2/5 bg-white border-r overflow-y-auto p-6">
          {selectedProblem && (
            <>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 lg:mb-4">{selectedProblem.title}</h2>
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
              
              {/* Input Format Guide */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">📥 Input Format</h3>
                <p className="text-sm text-blue-800">
                  {getInputFormatDescription(selectedProblem.testCases)}
                </p>
                <p className="text-xs text-blue-700 mt-2 italic">
                  💡 Tip: Your starter code template is already configured to read this format correctly!
                </p>
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

        {/* Code Editor - Full Screen */}
        <div className="flex-1 flex flex-col min-h-0 w-full">
          {/* Toolbar */}
          <div className="bg-white border-b p-2 lg:p-4 flex flex-col gap-2">
            {/* Top Row - Language and Problem Info Button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-gray-900 text-sm"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="c">C</option>
                </select>
                <button
                  onClick={() => setShowProblemDescription(true)}
                  className="lg:hidden bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  📄 Problem
                </button>
              </div>
              <span className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-full whitespace-nowrap">
                🌐 API
              </span>
            </div>
            
            {/* Bottom Row - Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleRunCode}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-xs sm:text-sm transition-colors font-medium"
              >
                ▶ Run
              </button>
              <button
                onClick={handleTestAllCases}
                disabled={testingAllCases}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm transition-colors font-medium"
              >
                {testingAllCases ? '⏳' : '🧪 Test'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!allTestsPassed || !contest || !isContestActive(contest.startTime, contest.endTime)}
                className="bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors"
                title={
                  !allTestsPassed
                    ? 'Click "Test All Cases" first and pass all tests'
                    : !contest || !isContestActive(contest.startTime, contest.endTime)
                    ? 'Contest is not active'
                    : 'Submit your solution'
                }
              >
                ✓ Submit
              </button>
            </div>
          </div>

          {/* Editor and I/O Section */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Code Editor - Takes 60% on mobile, 55% on desktop */}
            <div className="h-[60%] lg:h-[55%]" onClick={async () => {
              // Force full-screen when user clicks on editor
              if (!document.fullscreenElement) {
                try {
                  await document.documentElement.requestFullscreen();
                  setNotification({
                    show: true,
                    type: 'warning',
                    title: '🔒 Full-Screen Required',
                    message: 'You must stay in full-screen mode to write code. Exiting will be tracked as a violation.'
                  });
                  setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
                } catch (err) {
                  console.error('Failed to enter fullscreen:', err);
                }
              }
            }}>
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  readOnly: !document.fullscreenElement, // Make editor read-only if not in full-screen
                  // Disable copy-paste to prevent cheating
                  contextmenu: false,
                  quickSuggestions: false,
                  wordBasedSuggestions: 'off',
                }}
                onMount={(editor) => {
                  // Add click handler to editor to enforce full-screen
                  editor.onDidFocusEditorText(() => {
                    if (!document.fullscreenElement) {
                      document.documentElement.requestFullscreen().catch(err => {
                        console.error('Failed to enter fullscreen:', err);
                      });
                    }
                  });
                  
                  // Update editor readonly state based on fullscreen
                  const updateReadOnly = () => {
                    editor.updateOptions({ readOnly: !document.fullscreenElement });
                  };
                  document.addEventListener('fullscreenchange', updateReadOnly);
                  
                  // Prevent copy, cut, and paste
                  editor.onKeyDown((e) => {
                    const isCopy = (e.ctrlKey || e.metaKey) && e.code === 'KeyC';
                    const isCut = (e.ctrlKey || e.metaKey) && e.code === 'KeyX';
                    const isPaste = (e.ctrlKey || e.metaKey) && e.code === 'KeyV';
                    
                    if (isCopy || isCut || isPaste) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  });
                }}
              />
            </div>
            
            {/* Input/Output Section - Takes 40% on mobile, 45% on desktop */}
            <div className="h-[40%] lg:h-[45%] border-t bg-white flex-shrink-0 overflow-hidden">
              <div className="h-full flex flex-col p-2 lg:p-4 gap-2">
                {/* Test Input */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    📥 Test Input
                  </label>
                  <textarea
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="w-full flex-1 border-2 border-gray-300 rounded-lg p-2 font-mono text-xs focus:border-blue-500 focus:outline-none text-gray-900 resize-none"
                    placeholder="Enter test input here..."
                  />
                </div>
                
                {/* Output */}
                <div className="flex-1 min-h-0 flex flex-col">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    📤 Output
                  </label>
                  <pre className="w-full flex-1 border-2 border-gray-300 rounded-lg p-2 font-mono text-xs bg-gray-50 overflow-auto text-gray-900">
{testOutput || '// Output will appear here...\n// Click "Run" to test your code\n// Click "Test" to check all test cases\n// Click "Submit" after passing all tests'}
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
