
import { Link } from 'react-router-dom';

interface NavLinksProps {
  links: { name: string; href: string }[];
  className?: string;
}

export function NavLinks({ links, className = '' }: NavLinksProps) {
  return (
    <nav className={className}>
      {links.map((link) => (
        <Link
          key={link.name}
          to={link.href}
          className="text-foreground/80 hover:text-foreground transition-colors hover-transition"
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
