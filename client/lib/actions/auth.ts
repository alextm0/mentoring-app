'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export type AuthState = { error: string | null };

/* ---------- LOGIN ---------- */
export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get('email') as string | null;
  const password = formData.get('password') as string | null;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  // Cache the token in the cookie
  const cookieStore = await cookies();
  cookieStore.set('token', data.token);

  if (!res.ok) {
    const { message = 'Invalid credentials.' } = data;
    return { error: message };
  }

  redirect('/dashboard'); // 303 → ends execution
}

/* ---------- SIGN‑UP ---------- */
export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
    cache: 'no-store',
  });

  const data = await res.json();

  console.log("DATA: ", data);

  if (!res.ok) {
    const { message = 'Signup failed.' } = data;
    return { error: message };
  }

  redirect('/auth/login?registered=true');
}

/* ---------- LOG‑OUT ---------- */
export async function logoutAction() {
  redirect('/auth/login');
}
