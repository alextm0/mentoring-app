'use server';

import { Comment } from '@/types';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Get all comments for a submission
 */
export async function getCommentsBySubmissionId(submissionId: string): Promise<Comment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/comments/submission/${submissionId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch comments: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching comments for submission ${submissionId}:`, error);
    throw error;
  }
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(id: string): Promise<Comment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/comments/${id}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch comment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching comment ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new comment
 */
export async function createComment(comment: Partial<Comment>): Promise<Comment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(comment),
    });

    if (!res.ok) {
      throw new Error(`Failed to create comment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

/**
 * Update an existing comment
 */
export async function updateComment(id: string, comment: Partial<Comment>): Promise<Comment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/comments/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(comment),
    });

    if (!res.ok) {
      throw new Error(`Failed to update comment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error updating comment ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(id: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete comment: ${res.status}`);
    }
  } catch (error) {
    console.error(`Error deleting comment ${id}:`, error);
    throw error;
  }
}

/**
 * Create a comment on a specific line in a submission
 */
export async function createLineComment(
  submissionId: string,
  lineNumber: number,
  commentText: string
): Promise<Comment> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  const user = await getCurrentUser();

  try {
    const comment = {
      submission_id: submissionId,
      mentor_id: user.id,
      line_number: lineNumber,
      comment: commentText
    };

    const res = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(comment),
    });

    if (!res.ok) {
      throw new Error(`Failed to create line comment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating line comment:', error);
    throw error;
  }
}

/**
 * Get current user (helper function)
 */
async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/users/me`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Failed to fetch current user: ${res.status}`);
  return await res.json();
}

export async function createMultipleComments(comments: Partial<Comment>[]): Promise<Comment[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/comments/batch`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify({ comments }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create multiple comments: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating multiple comments:', error);
    throw error;
  }
} 