'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken, clearAuthToken, getTimeRemaining } from '@/lib/auth';
import { Contest } from '@/types';
import Logo from '@/components/Logo';

export default function JoinContestPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [contestCode, setContestCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [myContests, setMyContests] = useState<Contest[]>([]);
  const [loadingContests, setLoadingContests] = useState(true);

  const fetchMyContests = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/contests?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMyContests(data);
      }
    } catch (error) {
      console.error('Failed to fetch contests:', error);
    } finally {
      setLoadingContests(false);
    }
  }, []);

  useEffect(() => {
    // Check authentication
    const authUser = getAuthToken();
    if (!authUser) {
      router.push('/login');
      return;
    }
    setUser(authUser);

    // Fetch user's contests
    fetchMyContests(authUser.id);
  }, [router, fetchMyContests]);

  const handleJoinContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!contestCode.trim()) {
      setError('Please enter a contest code');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contests/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestCode: contestCode.toUpperCase(),
          userId: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join contest');
        setLoading(false);
        return;
      }

      // Redirect to contest page
      router.push(`/contest/${data.contest.id}`);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    router.push('/login');
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800'
    };
    return badges[status as keyof typeof badges] || badges.upcoming;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Logo size="sm" noLink />
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-white truncate">Aura-7F</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
              <div className="text-xs sm:text-sm hidden md:block max-w-[200px] truncate">
                <span className="font-medium text-white block truncate">{user.fullName}</span>
                <span className="text-gray-300 text-xs truncate block">({user.email})</span>
              </div>
              <Link
                href="/profile"
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Join Contest Section */}
          <div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Join a Contest
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Enter the contest code provided by your instructor to join
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleJoinContest}>
                <div className="mb-4">
                  <label htmlFor="contestCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Contest Code
                  </label>
                  <input
                    type="text"
                    id="contestCode"
                    value={contestCode}
                    onChange={(e) => setContestCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-lg font-mono tracking-wider"
                    placeholder="ABC123"
                    maxLength={10}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Usually a 6-character code like &quot;ALGO01&quot;
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Joining...' : 'Join Contest'}
                </button>
              </form>
            </div>

            {/* Quick Tips */}
            <div className="mt-4 sm:mt-6 bg-primary-500/10 border border-primary-400/30 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
              <h3 className="text-sm sm:text-base font-semibold text-white mb-2">💡 Quick Tips</h3>
              <ul className="text-xs sm:text-sm text-gray-200 space-y-1">
                <li>• Contest codes are case-insensitive</li>
                <li>• You can join multiple contests</li>
                <li>• Contests may have start/end times</li>
                <li>• Your submissions are auto-saved</li>
              </ul>
            </div>
          </div>

          {/* My Contests Section */}
          <div>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                My Contests
              </h2>

              {loadingContests ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : myContests.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-gray-600">No contests yet</p>
                  <p className="text-sm text-gray-500">Join your first contest using the form on the left</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myContests.map((contest) => (
                    <Link
                      key={contest.id}
                      href={`/contest/${contest.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{contest.title}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(contest.status)}`}>
                          {contest.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{contest.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{contest.problems.length} problems</span>
                        {contest.status === 'active' && (
                          <span className="text-green-600 font-medium">
                            ⏱️ {getTimeRemaining(contest.endTime)}
                          </span>
                        )}
                        {contest.status === 'upcoming' && (
                          <span className="text-blue-600">
                            Starts: {new Date(contest.startTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
