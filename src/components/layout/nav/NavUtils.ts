
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
