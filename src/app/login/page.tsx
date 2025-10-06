'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setAuthToken } from '@/lib/auth';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Check if user must change password
      if (data.mustChangePassword) {
        setUserId(data.user.id);
        setMustChangePassword(true);
        setLoading(false);
        return;
      }

      // Store auth token
      setAuthToken(data.user);
      
      // Clear any admin authentication flags
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminUser');
      
      // Redirect to join contest page
      router.push('/join');
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotPasswordMessage(null);

    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordMessage({ type: 'error', text: 'Email is required' });
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setForgotPasswordMessage({ 
        type: 'success', 
        text: `Password reset to: ${data.temporaryPassword}. Please login and change it immediately.` 
      });
      
      setTimeout(() => {
        setForgotPasswordModalOpen(false);
        setForgotPasswordEmail('');
        setForgotPasswordMessage(null);
      }, 5000);
    } catch (error: any) {
      setForgotPasswordMessage({ type: 'error', text: error.message || 'Failed to reset password' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError('');

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword === '123456') {
      setChangePasswordError('Please choose a different password than the temporary one');
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword: formData.password,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      // Now log in with new password
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: newPassword })
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error('Failed to login after password change');
      }

      setAuthToken(loginData.user);
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminUser');
      router.push('/join');
    } catch (error: any) {
      setChangePasswordError(error.message || 'Failed to change password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-2">
            Code and Conquer
          </p>
          <p className="text-gray-300">Welcome back! Sign in to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setForgotPasswordModalOpen(true)}
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Forgot Password?
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary-400 hover:text-primary-300 font-semibold">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Admin Link */}
        <div className="mt-6 text-center">
          <Link 
            href="/admin" 
            className="text-sm text-gray-400 hover:text-gray-300"
          >
            Admin Panel
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reset Password</h3>
            <p className="text-gray-700 mb-4">
              Enter your email address to reset your password to the default: <span className="font-bold">123456</span>
            </p>
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
              autoFocus
            />
            {forgotPasswordMessage && (
              <div className={`mb-4 p-3 rounded-lg ${forgotPasswordMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {forgotPasswordMessage.text}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setForgotPasswordModalOpen(false);
                  setForgotPasswordEmail('');
                  setForgotPasswordMessage(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Password Change Modal */}
      {mustChangePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Password Change Required</h3>
            <p className="text-gray-700 mb-4">
              You must change your password before continuing. Please enter a new secure password.
            </p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              {changePasswordError && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                  {changePasswordError}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold transition-colors"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
