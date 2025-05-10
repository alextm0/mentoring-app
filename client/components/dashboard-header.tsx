"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { User } from '@/types';
import { getCurrentUser } from '@/lib/actions/users';

export function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      // Clear the auth cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }

  return (
    <header className="bg-white border-b">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Mentoring App
          </Link>
          {user && (
            <span className="text-sm text-gray-600">
              {user.role === 'MENTOR' ? 'Mentor Dashboard' : 'Mentee Dashboard'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
