'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeaderboardEntry, Contest } from '@/types';
import Logo from '@/components/Logo';

interface TabSwitchLog {
  userId: string;
  userEmail: string;
  userName: string;
  switchCount: number;
  lastSwitchTime: string;
}

export default function AdminLeaderboardPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [contestId, setContestId] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contest, setContest] = useState<Contest | null>(null);
  const [tabSwitches, setTabSwitches] = useState<TabSwitchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      router.push('/admin');
      return;
    }
    setIsAdmin(true);

    params.then(({ id }) => {
      setContestId(id);
    });
  }, [params, router]);

  useEffect(() => {
    if (!contestId || !isAdmin) return;
    fetchData();
    const interval = setInterval(fetchData, 3000); // Refresh every 3 seconds for real-time updates
    return () => clearInterval(interval);
  }, [contestId, isAdmin]);

  const fetchData = async () => {
    try {
      const [leaderboardRes, contestRes, tabSwitchRes] = await Promise.all([
        fetch(`/api/contests/${contestId}/leaderboard`),
        fetch(`/api/contests/${contestId}`),
        fetch(`/api/tab-switches?contestId=${contestId}`)
      ]);
      
      const leaderboardData = await leaderboardRes.json();
      const contestData = await contestRes.json();
      const tabSwitchData = await tabSwitchRes.json();
      
      setLeaderboard(leaderboardData);
      setContest(contestData);
      setTabSwitches(tabSwitchData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePresentationMode = () => {
    setPresentationMode(!presentationMode);
    if (!presentationMode) {
      // Enter fullscreen
      document.documentElement.requestFullscreen?.();
    } else {
      // Exit fullscreen
      document.exitFullscreen?.();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900 ${presentationMode ? 'p-8' : ''}`}>
      {/* Navigation - Hide in presentation mode */}
      {!presentationMode && (
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/admin" className="flex items-center gap-3 text-xl font-bold text-white hover:text-primary-300 transition-colors">
                <Logo size="sm" />
                <span>{contest?.title} - Admin View</span>
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePresentationMode}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-colors"
                >
                  📊 Presentation Mode
                </button>
                <Link
                  href="/admin"
                  className="px-4 py-2 text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                >
                  Back to Admin
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Presentation Mode Controls */}
      {presentationMode && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={togglePresentationMode}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold shadow-lg"
          >
            Exit Presentation
          </button>
        </div>
      )}

      {/* Tab Switch Alerts Banner - Presentation Mode */}
      {presentationMode && Array.isArray(tabSwitches) && tabSwitches.filter(ts => ts.switchCount > 0).length > 0 && (
        <div className="fixed top-4 left-4 right-24 z-40 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl border-4 border-red-600">
          <h3 className="text-2xl font-bold mb-2">⚠️ TAB SWITCH ALERTS</h3>
          <div className="space-y-2">
            {tabSwitches
              .filter(ts => ts.switchCount > 0)
              .sort((a, b) => b.switchCount - a.switchCount)
              .slice(0, 3)
              .map((ts) => (
                <div key={ts.userId} className="flex justify-between items-center bg-white/20 px-4 py-2 rounded">
                  <span className="text-xl font-bold">{ts.userName}</span>
                  <span className="text-xl font-bold">{ts.switchCount} switches</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${presentationMode ? '' : 'max-w-7xl py-8'}`}>
        {/* Leaderboard */}
        <div className={`bg-white/95 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden ${presentationMode ? 'mb-8' : ''}`}>
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-6 py-6">
            <h1 className={`font-bold ${presentationMode ? 'text-5xl' : 'text-3xl'}`}>
              🏆 Live Leaderboard
            </h1>
            <p className={`text-primary-100 mt-2 ${presentationMode ? 'text-2xl' : 'text-lg'}`}>
              Real-time rankings • Updated every 3 seconds
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`bg-gray-100 ${presentationMode ? 'text-xl' : ''}`}>
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Rank</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Participant</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Points</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Problems Solved</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-800">Last Submission</th>
                    {!presentationMode && (
                      <th className="px-6 py-4 text-left font-bold text-gray-800">Tab Switches</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((entry, index) => {
                    const tabSwitchLog = Array.isArray(tabSwitches) ? tabSwitches.find(ts => ts.userId === entry.userId) : null;
                    return (
                      <tr 
                        key={entry.userId}
                        className={`hover:bg-gray-50 transition-colors ${presentationMode ? 'text-xl' : ''} ${
                          index === 0 ? 'bg-yellow-50' :
                          index === 1 ? 'bg-gray-50' :
                          index === 2 ? 'bg-orange-50' : ''
                        }`}
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {index === 0 && <span className="text-4xl">🥇</span>}
                            {index === 1 && <span className="text-4xl">🥈</span>}
                            {index === 2 && <span className="text-4xl">🥉</span>}
                            <span className={`font-bold text-gray-900 ${presentationMode ? 'text-3xl' : 'text-2xl'}`}>
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`font-bold text-gray-900 ${presentationMode ? 'text-2xl' : 'text-lg'}`}>
                            {entry.fullName}
                          </div>
                          {!presentationMode && (
                            <div className="text-sm text-gray-500">{entry.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className={`font-bold text-primary-600 ${presentationMode ? 'text-3xl' : 'text-2xl'}`}>
                            {entry.totalPoints}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className={`text-gray-900 ${presentationMode ? 'text-2xl' : 'text-lg'}`}>
                            {entry.solvedProblems} / {contest?.problems.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className={`text-gray-600 ${presentationMode ? 'text-xl' : 'text-sm'}`}>
                            {formatTime(entry.lastSubmissionTime)}
                          </div>
                        </td>
                        {!presentationMode && (
                          <td className="px-6 py-5 whitespace-nowrap">
                            {tabSwitchLog && tabSwitchLog.switchCount > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-red-500 font-bold text-lg">
                                  ⚠️ {tabSwitchLog.switchCount}
                                </span>
                              </div>
                            ) : (
                              <span className="text-green-500">✓ None</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Statistics Cards - Hide in presentation mode */}
        {!presentationMode && contest && Array.isArray(contest.problems) && (
          <div className="mt-8 grid md:grid-cols-4 gap-6">
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
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">⚠️ Tab Switches</h3>
              <p className="text-3xl font-bold text-red-600">
                {Array.isArray(tabSwitches) ? tabSwitches.reduce((sum, ts) => sum + ts.switchCount, 0) : 0}
              </p>
            </div>
          </div>
        )}

        {/* Tab Switch Alerts */}
        {!presentationMode && Array.isArray(tabSwitches) && tabSwitches.filter(ts => ts.switchCount > 0).length > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-red-900 mb-4">⚠️ Tab Switch Alerts</h3>
            <div className="space-y-2">
              {tabSwitches
                .filter(ts => ts.switchCount > 0)
                .sort((a, b) => b.switchCount - a.switchCount)
                .map((ts) => (
                  <div key={ts.userId} className="flex justify-between items-center bg-white p-3 rounded border border-red-300">
                    <div>
                      <span className="font-bold text-red-900 text-lg">{ts.userName}</span>
                      <span className="text-sm text-gray-600 ml-2">({ts.userEmail})</span>
                      <span className="text-sm text-gray-500 ml-3">
                        Last switch: {formatTime(ts.lastSwitchTime)}
                      </span>
                    </div>
                    <span className="text-red-600 font-bold text-lg">
                      {ts.switchCount} switches
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
