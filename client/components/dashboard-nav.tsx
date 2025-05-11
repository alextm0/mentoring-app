"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User } from '@/types';
import { getCurrentUser } from '@/lib/actions/users';

const mentorLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/assignments', label: 'Assignments' },
  { href: '/dashboard/resources', label: 'Resources' },
  { href: '/dashboard/submissions', label: 'Submissions' },
  { href: '/dashboard/profile', label: 'Profile' },
];

const menteeLinks = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/assignments', label: 'My Assignments' },
  { href: '/dashboard/resources', label: 'Resources' },
  { href: '/dashboard/submissions', label: 'My Submissions' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    }

    loadUser();
  }, []);

  // Determine links based on user role
  let links = user?.role === 'MENTOR' ? mentorLinks : menteeLinks;

  // Add monitoring link only for the specific mentor with email alextoma1704@gmail.com
  if (user?.role === 'MENTOR' && user?.email === 'alextoma1704@gmail.com') {
    links = [
      ...mentorLinks,
      { href: '/dashboard/monitoring', label: 'User Monitoring' }
    ];
  }

  return (
    <nav className="w-64 bg-gray-50 p-6 border-r">
      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-lg transition-colors ${
              pathname === link.href
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
