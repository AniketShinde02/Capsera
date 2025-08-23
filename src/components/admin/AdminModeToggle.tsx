"use client";

import React, { useState } from 'react';

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
  const [isEnabled, setIsEnabled] = useState(isAdminMode);

  const handleToggle = (next: boolean) => {
    setIsEnabled(next);
    if (onToggle) onToggle(next);
  };

  return (
    <div className={`flex items-center gap-3 p-2 rounded ${className}`}>
      <button
        aria-pressed={isEnabled}
        onClick={() => handleToggle(!isEnabled)}
        className={`px-3 py-1 rounded-md border text-sm ${isEnabled ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
      >
        {isEnabled ? 'Admin Mode' : 'User Mode'}
      </button>
    </div>
  );
}
