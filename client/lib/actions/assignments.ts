'use server';

import { Assignment, Submission } from '@/types';
import { cookies } from 'next/headers';


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function getAssignments(): Promise<Assignment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch assignments: ${res.status}`);
  return data;
}

export async function getMenteeAssignments(): Promise<Assignment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments/mine`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch mentee assignments: ${res.status}`);
  return data;
}

export async function getMentorAssignments(): Promise<Assignment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch mentor assignments: ${res.status}`);
  return data;
} 

export async function createAssignment(assignment: Assignment): Promise<Assignment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token?.value}`,
    },
    method: 'POST',
    body: JSON.stringify(assignment),
  });

  const data = await res.json();

  console.log("ASSIGNMENT CREATED: ", data)

  if (!res.ok) throw new Error(`Failed to create assignment: ${res.status}`);
  return data;
}

export async function getAssignmentById(id: string): Promise<Assignment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  console.log("ASSIGNMENT BY ID: ", id)

  const data = await res.json();


  if (!res.ok) throw new Error(`Failed to fetch assignment: ${res.status}`);
  return data;
}

export async function updateAssignment(id: string, assignment: Assignment): Promise<Assignment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments/${id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token?.value}`,
    },
    method: 'PUT',
    body: JSON.stringify(assignment),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(`Failed to update assignment: ${res.status}`);
  return data;
}

export async function deleteAssignment(id: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    method: 'DELETE',
  });

  if (!res.ok) throw new Error(`Failed to delete assignment: ${res.status}`);
  return; 
}

export async function getAssignmentSubmissions(assignmentId: string): Promise<Submission[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments/${assignmentId}/submissions`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();  

  if (!res.ok) throw new Error(`Failed to fetch assignment submissions: ${res.status}`);
  return data;
}