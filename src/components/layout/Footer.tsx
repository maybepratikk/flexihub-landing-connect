
import { Link } from 'react-router-dom';
import { ArrowUpIcon } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Logo and Mission */}
          <div className="md:col-span-1">
            <Link to="/" className="font-bold text-xl inline-block mb-4">
              IRL
            </Link>
            <p className="text-muted-foreground mb-4">
              Connecting exceptional talent with innovative opportunities in a curated environment.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground hover-transition">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/find-talent" className="text-muted-foreground hover:text-foreground hover-transition">
                  Find Talent
                </Link>
              </li>
              <li>
                <Link to="/find-projects" className="text-muted-foreground hover:text-foreground hover-transition">
                  Find Projects
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground hover-transition">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground hover-transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/success-stories" className="text-muted-foreground hover:text-foreground hover-transition">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link to="/tutorials" className="text-muted-foreground hover:text-foreground hover-transition">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-foreground hover-transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground hover-transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-foreground hover-transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground hover-transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-foreground hover-transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} IRL. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <button
              onClick={scrollToTop}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground hover-transition"
              aria-label="Scroll to top"
            >
              Back to top
              <ArrowUpIcon className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
