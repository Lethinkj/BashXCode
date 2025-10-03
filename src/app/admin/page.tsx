'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Contest, Problem, TestCase } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export default function AdminPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
  });
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    fetchContests();
  }, []);

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

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contest = {
      ...formData,
      problems,
    };

    const response = await fetch('/api/contests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contest),
    });

    if (response.ok) {
      setShowForm(false);
      setFormData({ title: '', description: '', startTime: '', endTime: '' });
      setProblems([]);
      fetchContests();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Clan Contest Platform - Admin
            </Link>
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
            {showForm ? 'Cancel' : 'Create New Contest'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Contest</h2>
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
                Create Contest
              </button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          <h2 className="text-2xl font-bold text-gray-900">Existing Contests</h2>
          {contests.map((contest) => (
            <div key={contest.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{contest.title}</h3>
                  <p className="text-gray-600 mt-2">{contest.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {contest.problems.length} problems
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyContestUrl(contest.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Copy URL
                  </button>
                  <Link
                    href={`/contest/${contest.id}/leaderboard`}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Leaderboard
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
