'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, type AuthState } from '@/lib/actions/auth';

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

      {state.error && (
        <div className="mb-4 p-2 text-red-500 bg-red-50 rounded">
          {state.error}
        </div>
      )}

      <form action={formAction}>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            required
            className="w-full p-2 border rounded"
            placeholder="Enter your password"
            autoComplete="current-password"
            minLength={6}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>

        <p className="mt-4 text-center text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
