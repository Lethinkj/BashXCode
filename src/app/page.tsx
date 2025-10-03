'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [contestUrl, setContestUrl] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('userName', userName);
      router.push('/contests');
    }
  };

  const handleJoinContest = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && contestUrl.trim()) {
      localStorage.setItem('userName', userName);
      // Extract contest ID from URL if it's a full URL
      const contestId = contestUrl.includes('/contest/') 
        ? contestUrl.split('/contest/')[1] 
        : contestUrl;
      router.push(`/contest/${contestId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">Clan Contest Platform</h1>
            </div>
            <div className="flex space-x-4">
              <Link href="/admin" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-primary-600">Clan Contest</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Compete with developers worldwide. Solve coding challenges, earn points, and climb the leaderboard!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Browse Contests */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse Contests</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="userName1" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Your Name
                </label>
                <input
                  type="text"
                  id="userName1"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition duration-200 font-medium"
              >
                View All Contests
              </button>
            </form>
          </div>

          {/* Join with URL */}
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join with Contest URL</h3>
            <form onSubmit={handleJoinContest} className="space-y-4">
              <div>
                <label htmlFor="userName2" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Your Name
                </label>
                <input
                  type="text"
                  id="userName2"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  required
                />
              </div>
              <div>
                <label htmlFor="contestUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Contest URL or ID
                </label>
                <input
                  type="text"
                  id="contestUrl"
                  value={contestUrl}
                  onChange={(e) => setContestUrl(e.target.value)}
                  placeholder="Contest ID or full URL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 font-medium"
              >
                Join Contest
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Multiple Languages</h4>
            <p className="text-gray-600">Code in Python, JavaScript, Java, C++, and C</p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Test Cases</h4>
            <p className="text-gray-600">5 test cases per problem for comprehensive evaluation</p>
          </div>

          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Live Leaderboard</h4>
            <p className="text-gray-600">Real-time rankings based on points and solve time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
