'use server';

import { Assignment, Submission } from '@/types';
import { cookies } from 'next/headers';


const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function getAssignments(): Promise<Assignment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/assignments`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch assignments: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
}

export async function getMenteeAssignments(): Promise<Assignment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/assignments/mine`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch mentee assignments: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching mentee assignments:', error);
    throw error;
  }
}

export async function getMentorAssignments(): Promise<Assignment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/assignments`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch mentor assignments: ${res.status}`);
  return data;
} 

export async function createAssignment(assignment: Partial<Assignment>): Promise<Assignment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/assignments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(assignment),
    });

    if (!res.ok) {
      throw new Error(`Failed to create assignment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
}

export async function getAssignmentById(id: string): Promise<Assignment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  // Log the token and ID for debugging
  console.log(`Fetching assignment: ${id}, Token exists: ${!!token?.value}`);

  try {
    const res = await fetch(`${API_URL}/assignments/${id}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });
        
    if (!res.ok) {
      if (res.status === 403) {
        console.error('Permission denied for this assignment. Check user role.');
        throw new Error(`Permission denied for assignment: ${res.status}`);
      } else {
        throw new Error(`Failed to fetch assignment: ${res.status}`);
      }
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching assignment ${id}:`, error);
    throw error;
  }
}

export async function updateAssignment(id: string, assignment: Partial<Assignment>): Promise<Assignment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/assignments/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(assignment),
    });

    if (!res.ok) {
      throw new Error(`Failed to update assignment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error updating assignment ${id}:`, error);
    throw error;
  }
}

export async function deleteAssignment(id: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/assignments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete assignment: ${res.status}`);
    }
  } catch (error) {
    console.error(`Error deleting assignment ${id}:`, error);
    throw error;
  }
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