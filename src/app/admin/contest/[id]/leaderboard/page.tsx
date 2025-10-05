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
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ userId: string; userName: string } | null>(null);
  const [banReason, setBanReason] = useState('');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleBanClick = (userId: string, userName: string) => {
    setSelectedUser({ userId, userName });
    setBanReason('');
    setBanModalOpen(true);
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) return;

    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const response = await fetch('/api/ban-user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': adminUser.id
        },
        body: JSON.stringify({
          contestId,
          userId: selectedUser.userId,
          reason: banReason.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      setBanModalOpen(false);
      setSelectedUser(null);
      setBanReason('');
      fetchData(); // Refresh leaderboard
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const response = await fetch(`/api/ban-user?contestId=${contestId}&userId=${userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-id': adminUser.id
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unban user');
      }

      fetchData(); // Refresh leaderboard
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    }
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
                <Logo size="sm" noLink />
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

      {/* Tab Switch Alert Popup - Auto-dismiss after 10 seconds */}
      {presentationMode && (() => {
        const recentSwitches = Array.isArray(tabSwitches) ? tabSwitches.filter(ts => {
          const timeSinceSwitch = Date.now() - new Date(ts.lastSwitchTime).getTime();
          return ts.switchCount > 0 && timeSinceSwitch < 10000; // Show for 10 seconds
        }) : [];
        
        return recentSwitches.slice(0, 1).map((ts) => (
          <div key={ts.userId} className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-8 py-6 rounded-2xl shadow-2xl border-4 border-red-700 animate-slide-up min-w-[400px]">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-3">⚠️ TAB SWITCH ALERT</h3>
              <p className="text-2xl font-bold mb-2">{ts.userName}</p>
              <p className="text-xl">{ts.switchCount} switches</p>
            </div>
          </div>
        ));
      })()}

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
              <table className="w-full min-w-full">
                <thead className={`bg-gray-100 ${presentationMode ? 'text-base md:text-xl' : 'text-sm md:text-base'}`}>
                  <tr>
                    <th className="px-2 md:px-6 py-3 md:py-4 text-left font-bold text-gray-800">Rank</th>
                    <th className="px-2 md:px-6 py-3 md:py-4 text-left font-bold text-gray-800">Participant</th>
                    <th className="px-2 md:px-6 py-3 md:py-4 text-left font-bold text-gray-800">Points</th>
                    <th className="px-2 md:px-6 py-3 md:py-4 text-left font-bold text-gray-800 hidden sm:table-cell">Problems</th>
                    <th className="px-2 md:px-6 py-3 md:py-4 text-left font-bold text-gray-800 hidden md:table-cell">Last Sub.</th>
                    {!presentationMode && (
                      <>
                        <th className="px-2 md:px-6 py-3 md:py-4 text-left font-bold text-gray-800 hidden lg:table-cell">Switches</th>
                        <th className="px-2 md:px-6 py-3 md:py-4 text-left font-bold text-gray-800">Actions</th>
                      </>
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
                        <td className="px-2 md:px-6 py-3 md:py-5 whitespace-nowrap">
                          <div className="flex items-center gap-1 md:gap-2">
                            {index === 0 && <span className="text-2xl md:text-4xl">🥇</span>}
                            {index === 1 && <span className="text-2xl md:text-4xl">🥈</span>}
                            {index === 2 && <span className="text-2xl md:text-4xl">🥉</span>}
                            <span className={`font-bold text-gray-900 ${presentationMode ? 'text-xl md:text-3xl' : 'text-lg md:text-2xl'}`}>
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 md:px-6 py-3 md:py-5">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className={`font-bold ${entry.isBanned ? 'text-red-600' : 'text-gray-900'} ${presentationMode ? 'text-base md:text-2xl' : 'text-sm md:text-lg'}`}>
                                {entry.isBanned && <span className="mr-1">🚫</span>}
                                {entry.fullName}
                              </div>
                              {!presentationMode && (
                                <div className="text-xs md:text-sm text-gray-500 truncate max-w-[150px] md:max-w-none">{entry.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 md:px-6 py-3 md:py-5 whitespace-nowrap">
                          <div className={`font-bold text-primary-600 ${presentationMode ? 'text-xl md:text-3xl' : 'text-lg md:text-2xl'}`}>
                            {entry.totalPoints}
                          </div>
                        </td>
                        <td className="px-2 md:px-6 py-3 md:py-5 whitespace-nowrap hidden sm:table-cell">
                          <div className={`text-gray-900 ${presentationMode ? 'text-base md:text-2xl' : 'text-sm md:text-lg'}`}>
                            {entry.solvedProblems} / {contest?.problems.length || 0}
                          </div>
                        </td>
                        <td className="px-2 md:px-6 py-3 md:py-5 whitespace-nowrap hidden md:table-cell">
                          <div className={`text-gray-600 ${presentationMode ? 'text-sm md:text-xl' : 'text-xs md:text-sm'}`}>
                            {formatTime(entry.lastSubmissionTime)}
                          </div>
                        </td>
                        {!presentationMode && (
                          <>
                            <td className="px-2 md:px-6 py-3 md:py-5 whitespace-nowrap hidden lg:table-cell">
                              {tabSwitchLog && tabSwitchLog.switchCount > 0 ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-red-500 font-bold text-base md:text-lg">
                                    ⚠️ {tabSwitchLog.switchCount}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-green-500 text-sm md:text-base">✓ None</span>
                              )}
                            </td>
                            <td className="px-2 md:px-6 py-3 md:py-5 whitespace-nowrap">
                              {entry.isBanned ? (
                                <button
                                  onClick={() => handleUnbanUser(entry.userId)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs md:text-sm rounded hover:bg-green-700 transition-colors font-semibold"
                                >
                                  Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleBanClick(entry.userId, entry.fullName)}
                                  className="px-3 py-1 bg-red-600 text-white text-xs md:text-sm rounded hover:bg-red-700 transition-colors font-semibold"
                                >
                                  Ban
                                </button>
                              )}
                            </td>
                          </>
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

      {/* Ban User Modal */}
      {banModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ban User</h3>
            <p className="text-gray-700 mb-4">
              You are about to ban <span className="font-bold text-red-600">{selectedUser.userName}</span> from this contest.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> The user will receive a message: &ldquo;Admin has banned you from this contest for violating rules.&rdquo;
              </p>
            </div>
            <div className="mb-4">
              <label htmlFor="banReason" className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for ban:
              </label>
              <textarea
                id="banReason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                rows={3}
                placeholder="Enter reason for ban..."
                autoFocus
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setBanModalOpen(false);
                  setSelectedUser(null);
                  setBanReason('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                disabled={!banReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
