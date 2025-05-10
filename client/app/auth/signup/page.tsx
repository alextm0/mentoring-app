'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { signupAction, type AuthState } from '@/lib/actions/auth';
import { useSearchParams } from 'next/navigation';

const initialState: AuthState = { error: null };

export default function SignupPage() {
  const [state, formAction] = useActionState(signupAction, initialState);
  const params = useSearchParams();
  const registered = params.get('registered') === 'true';

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

      {registered && (
        <div className="mb-4 p-2 text-green-600 bg-green-50 rounded">
          Registration successful! Please log in.
        </div>
      )}

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
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <select name="role" required className="w-full p-2 border rounded">
            <option value="">Select a role</option>
            <option value="MENTEE">Mentee</option>
            <option value="MENTOR">Mentor</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Sign Up
        </button>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
