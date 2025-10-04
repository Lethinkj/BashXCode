'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Contest, Problem, TestCase } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Default admin credentials
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export default function AdminPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContestId, setEditingContestId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Admin management state
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    password: '',
    fullName: '',
    isSuperAdmin: false,
  });

  useEffect(() => {
    // Check if already logged in
    const loggedIn = localStorage.getItem('adminAuthenticated');
    const adminUser = localStorage.getItem('adminUser');
    if (loggedIn === 'true' && adminUser) {
      setIsAuthenticated(true);
      setCurrentAdmin(JSON.parse(adminUser));
      fetchContests();
      fetchAdmins(JSON.parse(adminUser).id);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentAdmin) {
      fetchContests();
      fetchAdmins(currentAdmin.id);
    }
  }, [isAuthenticated, currentAdmin]);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/contests');
      const data = await response.json();
      if (Array.isArray(data)) {
        setContests(data);
      } else {
        console.error('API Error:', data);
        setContests([]);
      }
    } catch (error) {
      console.error('Failed to fetch contests:', error);
      setContests([]);
    }
  };

  const fetchAdmins = async (adminId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: { 'x-admin-id': adminId }
      });
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentAdmin?.id) {
      alert('You must be logged in as admin');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': currentAdmin.id
        },
        body: JSON.stringify(newAdminData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Admin created successfully!');
        setShowAdminForm(false);
        setNewAdminData({ email: '', password: '', fullName: '', isSuperAdmin: false });
        fetchAdmins(currentAdmin.id);
      } else {
        alert(`Failed to create admin: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error: Failed to create admin');
      console.error('Create admin error:', error);
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this admin?`)) {
      return;
    }

    try {
      // This would require a new API endpoint to update admin status
      alert('Admin status toggle not yet implemented');
    } catch (error) {
      console.error('Failed to toggle admin status:', error);
    }
  };

  // Helper to format datetime for input (YYYY-MM-DDTHH:mm)
  const formatDateTimeForInput = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // Format as YYYY-MM-DDTHH:mm in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Date format error:', error);
      return '';
    }
  };

  // Helper to convert local datetime-local input to ISO string
  const convertLocalToISO = (localDateTime: string): string => {
    if (!localDateTime) return '';
    // datetime-local gives us "YYYY-MM-DDTHH:mm"
    // We need to convert to ISO string preserving the local time
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContestId(contest.id);
    setFormData({
      title: contest.title,
      description: contest.description,
      startTime: formatDateTimeForInput(contest.startTime),
      endTime: formatDateTimeForInput(contest.endTime),
    });
    setProblems(contest.problems);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingContestId(null);
    setShowForm(false);
    setFormData({ title: '', description: '', startTime: '', endTime: '' });
    setProblems([]);
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate times
    if (!formData.startTime || !formData.endTime) {
      alert('Please set both start and end times');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (endDate <= startDate) {
      alert('End time must be after start time');
      return;
    }

    const contestData = {
      ...formData,
      startTime: convertLocalToISO(formData.startTime),
      endTime: convertLocalToISO(formData.endTime),
      problems,
    };

    try {
      const url = editingContestId 
        ? `/api/contests/${editingContestId}` 
        : '/api/contests';
      
      const method = editingContestId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contestData),
      });

      if (response.ok) {
        alert(editingContestId ? 'Contest updated successfully!' : 'Contest created successfully!');
        setShowForm(false);
        setEditingContestId(null);
        setFormData({ title: '', description: '', startTime: '', endTime: '' });
        setProblems([]);
        fetchContests();
      } else {
        const error = await response.json();
        alert(`Failed to ${editingContestId ? 'update' : 'create'} contest: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Contest operation error:', error);
      alert('Network error occurred');
    }
  };

  const addProblem = () => {
    if (problems.length >= 10) {
      alert('Maximum 10 problems allowed per contest');
      return;
    }
    const newProblem: Problem = {
      id: uuidv4(),
      title: '',
      description: '',
      difficulty: 'Easy',
      points: 100,
      testCases: Array(5).fill(null).map(() => ({
        id: uuidv4(),
        input: '',
        expectedOutput: '',
      })),
      timeLimit: 5,
      memoryLimit: 256,
    };
    setProblems([...problems, newProblem]);
  };

  const updateProblem = (index: number, field: string, value: any) => {
    const updated = [...problems];
    updated[index] = { ...updated[index], [field]: value };
    setProblems(updated);
  };

  const updateTestCase = (problemIndex: number, testIndex: number, field: string, value: string) => {
    const updated = [...problems];
    updated[problemIndex].testCases[testIndex] = {
      ...updated[problemIndex].testCases[testIndex],
      [field]: value,
    };
    setProblems(updated);
  };

  const copyContestUrl = (contestId: string) => {
    const url = `${window.location.origin}/contest/${contestId}`;
    navigator.clipboard.writeText(url);
    alert('Contest URL copied to clipboard!');
  };

  const copyContestCode = (contestCode: string) => {
    navigator.clipboard.writeText(contestCode);
    alert(`Contest code "${contestCode}" copied to clipboard!`);
  };

  const handleDeleteContest = async (contestId: string, title: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete the contest "${title}"?\n\n` +
      `This will permanently delete:\n` +
      `- The contest\n` +
      `- All problems\n` +
      `- All submissions\n` +
      `- All leaderboard data\n\n` +
      `This action cannot be undone!`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/contests/${contestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Contest deleted successfully!');
        fetchContests(); // Refresh the list
      } else {
        const error = await response.json();
        alert(`Failed to delete contest: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('Network error: Failed to delete contest');
      console.error('Delete error:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        setLoginError('');
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentAdmin(null);
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUser');
    setUsername('');
    setPassword('');
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">Admin Login</h1>
            <p className="text-gray-600">Clan Contest Platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-gray-900"
                placeholder="Enter admin email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent text-gray-900"
                placeholder="Enter password"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold transition"
            >
              Login
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-primary-600 hover:text-primary-700">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Clan Contest Platform - Admin
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">👤 Admin</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contest Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            {showForm ? 'Cancel' : (editingContestId ? 'Cancel Edit' : 'Create New Contest')}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingContestId ? 'Edit Contest' : 'Create Contest'}</h2>
            <form onSubmit={handleCreateContest} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contest Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Problems</h3>
                    <p className="text-sm text-gray-500">{problems.length}/10 problems added</p>
                  </div>
                  <button
                    type="button"
                    onClick={addProblem}
                    disabled={problems.length >= 10}
                    className={`px-4 py-2 rounded-lg ${
                      problems.length >= 10
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    Add Problem {problems.length >= 10 && '(Max reached)'}
                  </button>
                </div>

                {problems.map((problem, pIndex) => (
                  <div key={problem.id} className="border rounded-lg p-4 mb-4 bg-gray-50">
                    <h4 className="font-bold text-lg mb-4 text-gray-900">Problem {pIndex + 1}</h4>
                    <div className="grid gap-4">
                      <input
                        type="text"
                        placeholder="Problem Title"
                        value={problem.title}
                        onChange={(e) => updateProblem(pIndex, 'title', e.target.value)}
                        className="px-4 py-2 border rounded-lg text-gray-900"
                        required
                      />
                      <textarea
                        placeholder="Problem Description"
                        value={problem.description}
                        onChange={(e) => updateProblem(pIndex, 'description', e.target.value)}
                        className="px-4 py-2 border rounded-lg h-32 text-gray-900"
                        required
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <select
                          value={problem.difficulty}
                          onChange={(e) => updateProblem(pIndex, 'difficulty', e.target.value)}
                          className="px-4 py-2 border rounded-lg text-gray-900"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                        <input
                          type="number"
                          placeholder="Points"
                          value={problem.points}
                          onChange={(e) => updateProblem(pIndex, 'points', parseInt(e.target.value))}
                          className="px-4 py-2 border rounded-lg text-gray-900"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Time Limit (s)"
                          value={problem.timeLimit}
                          onChange={(e) => updateProblem(pIndex, 'timeLimit', parseInt(e.target.value))}
                          className="px-4 py-2 border rounded-lg text-gray-900"
                          required
                        />
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Test Cases (5 required)</h5>
                        {problem.testCases.map((testCase, tIndex) => (
                          <div key={testCase.id} className="grid grid-cols-2 gap-4 mb-2">
                            <input
                              type="text"
                              placeholder={`Test Case ${tIndex + 1} - Input`}
                              value={testCase.input}
                              onChange={(e) => updateTestCase(pIndex, tIndex, 'input', e.target.value)}
                              className="px-3 py-2 border rounded text-gray-900"
                              required
                            />
                            <input
                              type="text"
                              placeholder={`Expected Output`}
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(pIndex, tIndex, 'expectedOutput', e.target.value)}
                              className="px-3 py-2 border rounded text-gray-900"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-semibold"
                disabled={problems.length === 0}
              >
                {editingContestId ? 'Update Contest' : 'Create Contest'}
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Existing Contests</h2>
          {contests.map((contest) => (
            <div key={contest.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{contest.title}</h3>
                  <p className="text-gray-600 mt-2">{contest.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span>📝 {contest.problems.length} problems</span>
                    <span>🕒 {new Date(contest.startTime).toLocaleString()}</span>
                    <span>⏱️ {new Date(contest.endTime).toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Contest Code:</span>
                    <code className="bg-primary-50 text-primary-700 px-3 py-1 rounded font-mono font-bold text-lg">
                      {contest.contestCode || 'N/A'}
                    </code>
                    {contest.contestCode && (
                      <button
                        onClick={() => copyContestCode(contest.contestCode!)}
                        className="text-primary-600 hover:text-primary-700 text-sm underline"
                      >
                        Copy Code
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleEditContest(contest)}
                    className="mt-3 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 font-semibold text-sm"
                  >
                    ✏️ Edit Contest
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyContestUrl(contest.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Copy URL
                  </button>
                  <Link
                    href={`/admin/contest/${contest.id}/leaderboard`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center"
                  >
                    📊 Admin Leaderboard
                  </Link>
                  <button
                    onClick={() => handleDeleteContest(contest.id, contest.title)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin Management Section - Only for Super Admins */}
        {currentAdmin?.isSuperAdmin && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Management</h2>
                <p className="text-sm text-gray-600 mt-1">Manage admin users (Super Admin only)</p>
              </div>
              <button
                onClick={() => setShowAdminForm(!showAdminForm)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {showAdminForm ? 'Cancel' : 'Add New Admin'}
              </button>
            </div>

            {showAdminForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Admin</h3>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newAdminData.email}
                        onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg text-gray-900"
                        placeholder="admin@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={newAdminData.fullName}
                        onChange={(e) => setNewAdminData({ ...newAdminData, fullName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg text-gray-900"
                        placeholder="Admin Name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={newAdminData.password}
                      onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg text-gray-900"
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSuperAdmin"
                      checked={newAdminData.isSuperAdmin}
                      onChange={(e) => setNewAdminData({ ...newAdminData, isSuperAdmin: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isSuperAdmin" className="ml-2 text-sm text-gray-700">
                      Make this admin a <strong>Super Admin</strong> (can add/remove other admins)
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Create Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdminForm(false)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admins List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">All Admins ({admins.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                      <tr key={admin.id} className={admin.id === currentAdmin?.id ? 'bg-blue-50' : ''}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {admin.email}
                          {admin.id === currentAdmin?.id && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">You</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{admin.fullName}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {admin.isSuperAdmin ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">Super Admin</span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Admin</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {admin.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Disabled</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {admins.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No admins found
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
