
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Import the extracted components
import { NavLinks } from './nav/NavLinks';
import { UserMenu } from './nav/UserMenu';
import { MobileMenu } from './nav/MobileMenu';
import { NavbarLogo } from './nav/NavbarLogo';
import { getNavLinks } from './nav/NavUtils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Get navigation links based on user type
  const navLinks = getNavLinks(user);

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
          <NavbarLogo />

          {/* Desktop Navigation */}
          <NavLinks 
            links={navLinks} 
            className="hidden md:flex items-center space-x-8" 
          />

          {/* Desktop Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
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
            )}
            <UserMenu user={user} onSignOut={handleSignOut} />
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
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        navLinks={navLinks}
        user={user}
        onSignOut={handleSignOut}
      />
    </header>
  );
}
