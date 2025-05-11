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
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorMessage = `Failed to fetch current user: ${res.status}`;
    console.error(errorMessage);
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock user in development mode');
      return {
        id: 'mock-id',
        email: 'dev@example.com',
        role: 'MENTOR',
        created_at: new Date().toISOString()
      };
    }
    
    throw new Error(errorMessage);
  }
  
  const data = await res.json();
  return data;
} 

export async function getUserById(id: string): Promise<User> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  // Since we don't have a direct /users/:id endpoint,
  // we'll fetch all mentees and find the specific one
  const res = await fetch(`${API_URL}/users/mentees`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch mentees: ${res.status}`);
  }
  
  const mentees = await res.json();
  
  // Find the specific mentee by ID
  const user = mentees.find((mentee: User) => mentee.id === id);
  
  if (!user) {
    throw new Error(`User with ID ${id} not found`);
  }
  
  return user;
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

export async function getMentees(): Promise<User[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/users/mentees`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch mentees: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching mentees:', error);
    throw error;
  }
}

