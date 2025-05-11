'use server';

import { Resource } from '@/types';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function getResources(): Promise<Resource[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch resources: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
}

export async function getResourceById(id: string): Promise<Resource> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources/${id}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch resource: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching resource ${id}:`, error);
    throw error;
  }
}

export async function getResourcesByAssignmentId(assignmentId: string): Promise<Resource[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources/assignment/${assignmentId}`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch assignment resources: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching resources for assignment ${assignmentId}:`, error);
    throw error;
  }
}

export async function getGeneralResources(): Promise<Resource[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources/general`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch general resources: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching general resources:', error);
    throw error;
  }
}

export async function createResource(resource: Partial<Resource>): Promise<Resource> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(resource),
    });

    if (!res.ok) {
      throw new Error(`Failed to create resource: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error creating resource:', error);
    throw error;
  }
}

export async function updateResource(id: string, resource: Partial<Resource>): Promise<Resource> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify(resource),
    });

    if (!res.ok) {
      throw new Error(`Failed to update resource: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error updating resource ${id}:`, error);
    throw error;
  }
}

export async function deleteResource(id: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token?.value}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete resource: ${res.status}`);
    }
  } catch (error) {
    console.error(`Error deleting resource ${id}:`, error);
    throw error;
  }
}

export async function assignResourceToAssignment(
  resourceId: string, 
  assignmentId: string
): Promise<Resource> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  try {
    const res = await fetch(`${API_URL}/resources/${resourceId}/assign`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.value}`,
      },
      body: JSON.stringify({ assignment_id: assignmentId }),
    });

    if (!res.ok) {
      throw new Error(`Failed to assign resource to assignment: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Error assigning resource ${resourceId} to assignment ${assignmentId}:`, error);
    throw error;
  }
}