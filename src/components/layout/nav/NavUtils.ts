
import { User } from '@/lib/supabase/types';
import { ExtendedUser } from '@/contexts/AuthContext';

// Get navigation links based on user type
export const getNavLinks = (user: User | ExtendedUser | null) => {
  const commonLinks: { name: string; href: string }[] = [];
  
  if (!user) {
    return commonLinks;
  }
  
  // Handle both ExtendedUser and regular User types
  let userType: string | undefined;
  
  if ('user_metadata' in user && user.user_metadata) {
    userType = user.user_metadata.user_type;
  } else if ('user_type' in user) {
    userType = user.user_type;
  }
  
  // Check if the user is an admin
  const isAdmin = userType === 'admin';
  
  // Add admin link if user is admin
  if (isAdmin) {
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
