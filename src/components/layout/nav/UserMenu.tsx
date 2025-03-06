
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/supabase/types';
import { ExtendedUser } from '@/contexts/AuthContext';

interface UserMenuProps {
  user: User | ExtendedUser | null;
  onSignOut: (e: React.MouseEvent) => Promise<void>;
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  if (!user) {
    return (
      <>
        <Button asChild variant="ghost" className="hover-transition">
          <Link to="/signin">Sign in</Link>
        </Button>
        <Button asChild className="btn-scale">
          <Link to="/signup">Sign up</Link>
        </Button>
      </>
    );
  }

  // Type guard to safely access user email
  const userEmail = 'email' in user && user.email 
    ? user.email 
    : ('user_metadata' in user && typeof user.user_metadata === 'object' && user.user_metadata !== null) 
      ? (user.user_metadata as any).email || ''
      : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 hover-transition">
          <span>Account</span>
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium">
          {userEmail}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
