import React from 'react';

interface MonitoringLayoutProps {
  children: React.ReactNode;
}

export default function MonitoringLayout({ children }: MonitoringLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Monitored Users</h2>
      </div>
      <div>{children}</div>
    </div>
  );
} 