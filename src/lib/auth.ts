/**
 * Authentication Utilities
 * Handles user authentication, session management, and security
 */

import bcrypt from 'bcryptjs';
import { AuthUser } from '@/types';

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: At least 6 characters
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' };
  }
  
  return { valid: true };
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authUser', JSON.stringify(user));
    localStorage.setItem('authTime', Date.now().toString());
  }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('authUser');
    const authTime = localStorage.getItem('authTime');
    
    if (!userStr || !authTime) return null;
    
    // Check if session is older than 24 hours
    const sessionAge = Date.now() - parseInt(authTime);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxAge) {
      clearAuthToken();
      return null;
    }
    
    return JSON.parse(userStr) as AuthUser;
  } catch (error) {
    return null;
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authTime');
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Generate a simple contest code from title
 */
export function generateContestCode(title: string): string {
  // Remove special characters and spaces
  let code = title
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
  
  // Pad with random numbers if too short
  while (code.length < 6) {
    code += Math.floor(Math.random() * 10);
  }
  
  return code;
}

/**
 * Check if contest is currently active
 */
export function isContestActive(startTime: string, endTime: string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return now >= start && now <= end;
}

/**
 * Check if contest has started
 */
export function hasContestStarted(startTime: string): boolean {
  return new Date() >= new Date(startTime);
}

/**
 * Check if contest has ended
 */
export function hasContestEnded(endTime: string): boolean {
  return new Date() >= new Date(endTime);
}

/**
 * Get contest status
 */
export function getContestStatus(startTime: string, endTime: string): 'upcoming' | 'active' | 'ended' {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
}

/**
 * Format time remaining
 */
export function getTimeRemaining(endTime: string): string {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h remaining`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  
  return `${minutes}m remaining`;
}
