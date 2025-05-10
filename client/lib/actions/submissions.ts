'use server';

import { Submission } from '@/types';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function getSubmissions(): Promise<Submission[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/submissions/mine`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch submissions: ${res.status}`);
  return data;
} 

export async function getSubmissionById(id: string): Promise<Submission> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/submissions/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();

  if (!res.ok) throw new Error(`Failed to fetch submission: ${res.status}`);
  return data;
}

export async function createSubmission(submission: Submission): Promise<Submission> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/submissions`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token?.value}`,
    },
    method: 'POST',
    body: JSON.stringify(submission), 
  });

  const data = await res.json();

  if (!res.ok) throw new Error(`Failed to create submission: ${res.status}`);
  return data;
}

export async function updateSubmission(id: string, submission: Submission): Promise<Submission> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/submissions/${id}`, {
    credentials: 'include',
    headers: {  
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token?.value}`,
    },
    method: 'PUT',
    body: JSON.stringify(submission),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(`Failed to update submission: ${res.status}`);
  return data;
}

export async function deleteSubmission(id: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/submissions/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    method: 'DELETE',
  });

  if (!res.ok) throw new Error(`Failed to delete submission: ${res.status}`);
  return;
}