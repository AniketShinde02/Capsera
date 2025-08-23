"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, User } from 'lucide-react';

interface AdminModeToggleProps {
  isAdminMode?: boolean;
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export default function AdminModeToggle({
  isAdminMode = true,
  onToggle,
  className = ''
}: AdminModeToggleProps) {
  const [isEnabled, setIsEnabled] = useState<boolean>(isAdminMode);

  const handleToggle = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    if (onToggle) onToggle(next);
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded ${className}`}>
      <div className="flex items-center gap-2">
        {isEnabled ? (
          <Shield className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{isEnabled ? 'Admin Mode' : 'User Mode'}</span>
          <span className="text-xs text-muted-foreground">{isEnabled ? 'Full system access' : 'Limited access'}</span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleToggle}>
          {isEnabled ? 'Switch to User' : 'Switch to Admin'}
        </Button>
        <Badge variant={isEnabled ? 'default' : 'secondary'} className="text-xs">
          {isEnabled ? 'ON' : 'OFF'}
        </Badge>
      </div>
    </div>
  );
}
