'use server';

import { User } from '@/types';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function getCurrentUser(): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/users/me`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch current user: ${res.status}`);
  return data;
} 

export async function getUserById(id: string): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/users/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();  
  
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
  return data;
}

export async function updateUser(id: string, user: User): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/users/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token?.value}`,
    },
    method: 'PUT',
    body: JSON.stringify(user),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(`Failed to update user: ${res.status}`);
  return data;
}

