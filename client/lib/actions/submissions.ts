'use server';

import { Submission, Comment } from '@/types';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function getSubmissions(): Promise<Submission[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch submissions: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
}

export async function getSubmissionById(id: string): Promise<Submission> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/${id}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch submission: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching submission ${id}:`, error);
    throw error;
  }
}

export async function getSubmissionWithComments(id: string): Promise<Submission & { comments: Comment[] }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/${id}/with-comments`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch submission with comments: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching submission ${id} with comments:`, error);
    throw error;
  }
}

export async function getSubmissionsByAssignmentId(assignmentId: string): Promise<Submission[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/assignment/${assignmentId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch submissions for assignment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
    throw error;
  }
}

export async function getMySubmissions(): Promise<Submission[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/mine`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch my submissions: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching my submissions:', error);
    throw error;
  }
}

export async function createSubmission(submission: Partial<Submission>): Promise<Submission> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(submission),
    });

    if (!res.ok) {
      throw new Error(`Failed to create submission: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating submission:', error);
    throw error;
  }
}

export async function updateSubmission(id: string, submission: Partial<Submission>): Promise<Submission> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(submission),
    });

    if (!res.ok) {
      throw new Error(`Failed to update submission: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error updating submission ${id}:`, error);
    throw error;
  }
}

export async function markSubmissionAsComplete(id: string): Promise<Submission> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/${id}/complete`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify({ completed: true }),
    });

    if (!res.ok) {
      throw new Error(`Failed to mark submission as complete: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error marking submission ${id} as complete:`, error);
    throw error;
  }
}

export async function deleteSubmission(id: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete submission: ${res.status}`);
    }
  } catch (error) {
    console.error(`Error deleting submission ${id}:`, error);
    throw error;
  }
}

export async function getMenteeSubmissionForAssignment(assignmentId: string): Promise<Submission | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/submissions/assignment/${assignmentId}/mine`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch submission for assignment: ${res.status}`);
    }

    const data = await res.json();
    return data; // Will be null if no submission exists
  } catch (error) {
    console.error(`Error fetching submission for assignment ${assignmentId}:`, error);
    throw error;
  }
}