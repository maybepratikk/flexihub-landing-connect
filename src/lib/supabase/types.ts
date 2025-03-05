
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: 'freelancer' | 'client';
  freelancer_profile?: FreelancerProfile;
  client_profile?: ClientProfile;
}

export interface FreelancerProfile {
  id?: string;
  hourly_rate?: number;
  years_experience?: number;
  title?: string;
  bio?: string;
  skills?: string[];
  availability?: string;
  portfolio_url?: string;
  education?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientProfile {
  id?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  company_description?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}
