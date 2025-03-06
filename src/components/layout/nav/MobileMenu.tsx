
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { User } from '@/lib/supabase/types';
import { ExtendedUser } from '@/contexts/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  navLinks: { name: string; href: string }[];
  user: User | ExtendedUser | null;
  onSignOut: (e: React.MouseEvent) => Promise<void>;
}

export function MobileMenu({ isOpen, navLinks, user, onSignOut }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 animate-slide-in">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="py-2 text-foreground/80 hover:text-foreground"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <>
                <Link
                  to="/messages"
                  className="flex items-center py-2 text-foreground/80 hover:text-foreground"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Messages
                </Link>
                <Link
                  to="/dashboard"
                  className="block py-2 text-foreground/80 hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block py-2 text-foreground/80 hover:text-foreground"
                >
                  Profile
                </Link>
                <button
                  onClick={onSignOut}
                  className="block w-full text-left py-2 text-foreground/80 hover:text-foreground"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block py-2 text-foreground/80 hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 text-foreground/80 hover:text-foreground font-medium"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
