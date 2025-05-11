'use server';

import { MonitoredUser } from '@/types';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

/**
 * Get all active monitored users
 */
export async function getActiveMonitoredUsers(): Promise<MonitoredUser[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      console.error('Authentication required - No token found');
      return [];
    }

    // Log the request for debugging
    console.log(`Fetching active monitored users from ${API_URL}/monitored-users/active`);
    
    const res = await fetch(`${API_URL}/monitored-users/active`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    // Handle different status codes
    if (res.status === 403) {
      console.error('Access denied - You do not have permission to view monitored users');
      return [];
    }

    if (res.status === 500) {
      console.error('Server error (500) when fetching monitored users');
      return [];
    }

    if (!res.ok) {
      const errorMessage = `Failed to fetch monitored users: ${res.status}`;
      console.error(errorMessage);
      return [];
    }

    // Parse response
    try {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (parseError) {
      console.error('Error parsing monitored users response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching active monitored users:', error);
    return [];
  }
}

/**
 * Get all monitored users (including resolved)
 */
export async function getAllMonitoredUsers(): Promise<MonitoredUser[]> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      console.error('Authentication required - No token found');
      return [];
    }

    // Log the request for debugging
    console.log(`Fetching all monitored users from ${API_URL}/monitored-users`);
    
    const res = await fetch(`${API_URL}/monitored-users`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    // Handle different status codes
    if (res.status === 403) {
      console.error('Access denied - You do not have permission to view monitored users');
      return [];
    }

    if (res.status === 500) {
      console.error('Server error (500) when fetching monitored users');
      return [];
    }

    if (!res.ok) {
      const errorMessage = `Failed to fetch monitored users: ${res.status}`;
      console.error(errorMessage);
      return [];
    }

    // Parse response
    try {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (parseError) {
      console.error('Error parsing monitored users response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error fetching all monitored users:', error);
    return [];
  }
}

/**
 * Resolve a monitored user
 */
export async function resolveMonitoredUser(
  id: string,
  resolutionNotes: string
): Promise<MonitoredUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token?.value) {
      console.error('Authentication required - No token found');
      return null;
    }

    const res = await fetch(`${API_URL}/monitored-users/${id}/resolve`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ resolution_notes: resolutionNotes }),
      cache: 'no-store',
    });

    if (res.status === 403) {
      throw new Error('Access denied - You do not have permission to resolve monitored users');
    }

    if (res.status === 500) {
      throw new Error('Server error when resolving monitored user');
    }

    if (!res.ok) {
      const errorMessage = `Failed to resolve monitored user: ${res.status}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const data = await res.json();
      return data;
    } catch (parseError) {
      console.error('Error parsing resolve monitored user response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error resolving monitored user:', error);
    throw error;
  }
} 