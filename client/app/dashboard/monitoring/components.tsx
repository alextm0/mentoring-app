'use client';

import { Button } from '@/components/ui/button';

export function ActionButton({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-auto"
      disabled={disabled}
      onClick={() => console.log('Button clicked for', label)}
    >
      {label}
    </Button>
  );
}

export function ReturnButton() {
  return (
    <Button 
      variant="outline" 
      onClick={() => window.location.href = '/dashboard'}
    >
      Return to Dashboard
    </Button>
  );
} 