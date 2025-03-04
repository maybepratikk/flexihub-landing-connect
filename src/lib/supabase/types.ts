
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: 'freelancer' | 'client';
  created_at?: string;
};

export type FreelancerProfile = {
  id: string;
  bio?: string;
  hourly_rate?: number;
  skills?: string[];
  years_experience?: number;
  education?: string;
  portfolio_links?: string[];
  availability?: string;
  created_at?: string;
  updated_at?: string;
};

export type ClientProfile = {
  id: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  company_description?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
};

export type Job = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  budget_min?: number;
  budget_max?: number;
  budget_type: 'fixed' | 'hourly';
  duration?: 'short' | 'medium' | 'long' | null;
  experience_level?: 'entry' | 'intermediate' | 'expert' | null;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export type JobApplication = {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter?: string;
  pitch?: string;
  proposed_rate?: number;
  contact_phone?: string;
  contact_email?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
    id?: string;
  };
  freelancer_profiles?: {
    bio?: string;
    skills?: string[];
    years_experience?: number;
    portfolio_links?: string[];
  };
  jobs?: {
    title?: string;
    budget_type?: string;
    status?: string;
    id?: string;
  };
};

export type Contract = {
  id: string;
  job_id: string;
  freelancer_id: string;
  client_id: string;
  rate: number;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'terminated';
  created_at?: string;
  updated_at?: string;
  profiles?: {
    client_id?: {
      id?: string;
      full_name?: string;
      avatar_url?: string;
    };
    freelancer_id?: {
      id?: string;
      full_name?: string;
      avatar_url?: string;
    };
  };
  jobs?: {
    title?: string;
    description?: string;
    budget_type?: 'fixed' | 'hourly';
    id?: string;
  };
};

export type ChatMessage = {
  id: string;
  contract_id: string;
  sender_id: string;
  message: string;
  created_at?: string;
  read: boolean;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
};
