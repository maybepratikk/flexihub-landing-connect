
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get user type from user metadata
  const userType = user?.user_metadata?.user_type;

  // Define navigation links based on user type
  const getNavLinks = () => {
    const commonLinks = [{ name: 'How it Works', href: '/how-it-works' }];
    
    if (!user) {
      return commonLinks;
    }
    
    if (userType === 'admin') {
      return [
        ...commonLinks,
        { name: 'Admin Dashboard', href: '/admin' }
      ];
    }
    
    if (userType === 'client') {
      return [
        ...commonLinks,
        { name: 'Find Talent', href: '/find-talent' }
      ];
    }
    
    if (userType === 'freelancer') {
      return [
        ...commonLinks,
        { name: 'Find Projects', href: '/find-projects' }
      ];
    }
    
    return commonLinks;
  };

  const navLinks = getNavLinks();

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Sign out clicked");
    
    try {
      await signOut();
      // Navigation is now handled in the AuthContext
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled ? 
          "bg-white/80 backdrop-blur-md shadow-sm" : 
          "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl">
            FreelanceHub
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground/80 hover:text-foreground transition-colors hover-transition"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {userType === 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover-transition text-red-500"
                    asChild
                  >
                    <Link to="/admin" aria-label="Admin Dashboard">
                      <ShieldAlert size={20} />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover-transition"
                  asChild
                >
                  <Link to="/messages" aria-label="Messages">
                    <MessageSquare size={20} />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover-transition">
                      <span>Account</span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    {userType === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="hover-transition">
                  <Link to="/signin">Sign in</Link>
                </Button>
                <Button asChild className="btn-scale">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
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
                    {userType === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center py-2 text-red-500 hover:text-red-600"
                      >
                        <ShieldAlert size={16} className="mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
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
                      onClick={handleSignOut}
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
      )}
    </header>
  );
}
