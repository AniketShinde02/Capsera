'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  User, 
  Settings,
  AlertTriangle
} from 'lucide-react';

interface AdminModeToggleProps {
  isAdminMode?: boolean;
  onToggle?: (isAdmin: boolean) => void;
  className?: string;
}

export default function AdminModeToggle({ 
  isAdminMode = true, 
  onToggle,
  className = '' 
}: AdminModeToggleProps) {
  const [isEnabled, setIsEnabled] = useState(isAdminMode);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (onToggle) {
      onToggle(enabled);
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 bg-card border rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        {isEnabled ? (
          <Shield className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-muted-foreground" />
        )}
        
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {isEnabled ? 'Admin Mode' : 'User Mode'}
          </span>
          <span className="text-xs text-muted-foreground">
            {isEnabled ? 'Full system access' : 'Limited access'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-primary"
        />
        
        <Badge 
          variant={isEnabled ? 'default' : 'secondary'}
          className="text-xs"
        >
          {isEnabled ? 'ON' : 'OFF'}
        </Badge>
      </div>
    </div>
  );
}

