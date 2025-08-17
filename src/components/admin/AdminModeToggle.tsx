'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  User, 
  SwitchCamera,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminMode } from '@/context/AdminModeContext';

interface AdminModeToggleProps {
  className?: string;
}

export default function AdminModeToggle({ className = '' }: AdminModeToggleProps) {
  const { toast } = useToast();
  const { 
    isAdminMode, 
    currentMode, 
    switchToUserMode, 
    switchToAdminMode, 
    canBrowseAsUser, 
    hasRegularUserAccount 
  } = useAdminMode();

  const toggleMode = async () => {
    if (!canBrowseAsUser) return;

    try {
      if (isAdminMode) {
        // Switching to user mode
        await switchToUserMode();
      } else {
        // Switching back to admin mode
        await switchToAdminMode();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to switch modes",
        variant: "destructive"
      });
    }
  };

  // Don't show if user is not admin or can't browse as user
  if (!canBrowseAsUser) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Mode Indicator */}
      <div className="flex items-center gap-2">
        <div className="transition-all duration-300 ease-in-out transform">
          {isAdminMode ? (
            <>
              <Shield className="h-4 w-4 text-primary" />
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Admin Mode
              </Badge>
            </>
          ) : (
            <>
              <User className="h-4 w-4 text-green-600 dark:text-green-400" />
              <Badge variant="default" className="bg-green-600 dark:bg-green-500 text-white">
                User Mode
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Mode Toggle Button */}
      <Button
        onClick={toggleMode}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-border hover:bg-accent hover:text-accent-foreground overflow-hidden"
      >
        <SwitchCamera className="h-4 w-4 flex-shrink-0" />
        <span className="transition-all duration-300 ease-in-out transform">
          {isAdminMode ? 'Browse Site' : 'Admin Dashboard'}
        </span>
      </Button>

      {/* Info Badge */}
      {hasRegularUserAccount && (
        <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
          <Crown className="h-3 w-3 mr-1" />
          Dual Mode
        </Badge>
      )}
    </div>
  );
}
