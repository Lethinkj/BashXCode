'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthToken } from '@/lib/auth';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getAuthToken();
    if (user) {
      router.push('/join');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Navigation */}
      <nav className="border-b border-dark-800 bg-dark-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo size="md" showText={true} />
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-primary-400 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-dark-800"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="bg-primary-500 text-white hover:bg-primary-600 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg hover:shadow-primary-500/20"
              >
                Get Started
              </Link>
              <Link 
                href="/admin" 
                className="text-gray-500 hover:text-gray-400 px-3 py-2 rounded-lg text-sm transition-all"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative">
          <div className="text-center mb-20 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Welcome to <span className="gradient-text">Aura-7F Contests</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Modern competitive programming platform.<br />
              Solve challenges, compete globally, and climb the leaderboard.
            </p>
            <div className="mt-12 flex justify-center gap-6 flex-wrap">
              <Link
                href="/register"
                className="group px-8 py-4 bg-primary-500 text-white text-lg font-semibold rounded-lg hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30 hover:-translate-y-0.5"
              >
                Start Competing
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-dark-800 text-white text-lg font-semibold rounded-lg hover:bg-dark-700 transition-all border border-dark-600 hover:border-primary-500/50"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10 group">
            <div className="bg-primary-500/10 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors">
              <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-3">5 Languages</h3>
            <p className="text-gray-400 leading-relaxed">Python, JavaScript, Java, C++, and C support with instant execution</p>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10 group">
            <div className="bg-green-500/10 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
              <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-3">Instant Execution</h3>
            <p className="text-gray-400 leading-relaxed">Hybrid browser + API system for fast, reliable code testing</p>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10 group">
            <div className="bg-primary-500/10 rounded-lg w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-primary-500/20 transition-colors">
              <svg className="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-semibold text-white mb-3">Live Leaderboard</h3>
            <p className="text-gray-400 leading-relaxed">Real-time rankings with dynamic scoring and performance tracking</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-dark-800/50 border border-dark-700 rounded-2xl p-12 backdrop-blur-sm">
          <h3 className="text-3xl font-display font-bold text-center mb-12 gradient-text">
            How It Works
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Create Account</h4>
                <p className="text-gray-400">Quick sign up with email and password</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Join Contest</h4>
                <p className="text-gray-400">Enter contest code from your instructor</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Solve Problems</h4>
                <p className="text-gray-400">Write, test, and submit your solutions</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 font-bold">
                4
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Climb Leaderboard</h4>
                <p className="text-gray-400">Earn points and compete for top position</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/register"
              className="inline-block px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:shadow-primary-500/30"
            >
              Start Competing Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <Logo size="sm" showText={true} />
            <div className="text-center md:text-left text-gray-400 text-sm">
              <p>&copy; 2025 Aura-7F. Modern competitive programming platform.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
