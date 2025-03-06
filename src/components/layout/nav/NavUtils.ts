
import { User } from '@/lib/supabase/types';

// Get navigation links based on user type
export const getNavLinks = (user: User | null) => {
  const commonLinks: { name: string; href: string }[] = [];
  
  if (!user) {
    return commonLinks;
  }
  
  const userType = user?.user_metadata?.user_type;
  
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
