'use server';

import { Resource } from '@/types';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

export async function getResources(): Promise<Resource[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/resources`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();  
  
  if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
  return data;
}

export async function getMenteeResources(): Promise<Resource[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/resources/mine`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch mentee resources: ${res.status}`);
  return data;
}

export async function getResource(id: string): Promise<Resource> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/resources/${id}`, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  
  if (!res.ok) throw new Error(`Failed to fetch resource: ${res.status}`);
  return data;
}

export async function createResource(data: Partial<Resource>): Promise<Resource> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/resources`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const responseData = await res.json();
  
  if (!res.ok) throw new Error(`Failed to create resource: ${res.status}`);
  return responseData;
} 

export async function updateResource(id: string, data: Partial<Resource>): Promise<Resource> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/resources/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const responseData = await res.json(); 
  
  if (!res.ok) throw new Error(`Failed to update resource: ${res.status}`);
  return responseData;
}

export async function deleteResource(id: string): Promise<void> {
  const cookieStore = await cookies(); 
  const token = cookieStore.get('token');

  const res = await fetch(`${API_URL}/resources/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token?.value}`,
    },
    credentials: 'include',
  });

  if (!res.ok) throw new Error(`Failed to delete resource: ${res.status}`);
  return;
}