'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LeaderboardEntry, Contest } from '@/types';
import Logo from '@/components/Logo';

export default function LeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const [contestId, setContestId] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contest, setContest] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setContestId(id);
    });
  }, []);

  useEffect(() => {
    if (!contestId) return;
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds for faster updates
    return () => clearInterval(interval);
  }, [contestId]);

  const fetchData = async () => {
    try {
      const [leaderboardRes, contestRes] = await Promise.all([
        fetch(`/api/contests/${contestId}/leaderboard`),
        fetch(`/api/contests/${contestId}`)
      ]);
      
      const leaderboardData = await leaderboardRes.json();
      const contestData = await contestRes.json();
      
      setLeaderboard(leaderboardData);
      setContest(contestData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={`/contest/${contestId}`} className="flex items-center gap-3 text-xl font-bold text-white hover:text-primary-300 transition-colors">
              <Logo size="sm" />
              <span>{contest?.title} - Leaderboard</span>
            </Link>
            <Link
              href={`/contest/${contestId}`}
              className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-semibold transition-colors"
            >
              Back to Contest
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">🏆 Contest Leaderboard</h1>
            <p className="text-primary-100 mt-1">Real-time rankings based on points and solve time</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Total Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Problems Solved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Last Submission
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={entry.userId}
                      className={`hover:bg-gray-50 ${
                        index === 0 ? 'bg-yellow-50' :
                        index === 1 ? 'bg-gray-50' :
                        index === 2 ? 'bg-orange-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                          {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                          {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                          <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-900">{entry.fullName}</div>
                        <div className="text-sm text-gray-500">{entry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xl font-bold text-primary-600">{entry.totalPoints}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg text-gray-900">
                          {entry.solvedProblems} / {(contest && Array.isArray(contest.problems)) ? contest.problems.length : 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(entry.lastSubmissionTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {contest && Array.isArray(contest.problems) && (
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">👥 Total Participants</h3>
              <p className="text-3xl font-bold text-primary-600">{leaderboard.length}</p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Total Problems</h3>
              <p className="text-3xl font-bold text-primary-600">{contest.problems.length}</p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Total Points</h3>
              <p className="text-3xl font-bold text-primary-600">
                {contest.problems.reduce((sum, p) => sum + p.points, 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
