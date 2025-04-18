

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
  portfolio_links?: string[];
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

// Add Job interface
export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  skills_required: string[];
  budget_min: number;
  budget_max: number;
  budget_type: string;
  experience_level?: string;
  duration?: string;
  status: string;
  client_id: string;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Add JobApplication interface
export interface JobApplication {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter?: string;
  pitch?: string;
  proposed_rate?: number;
  status: string;
  contact_email?: string;
  contact_phone?: string;
  created_at?: string;
  updated_at?: string;
  job?: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
  };
  freelancer?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  profiles?: {
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    skills?: string[];
    years_experience?: number;
    portfolio_links?: string[];
  };
  // Add the freelancer_profiles property that's being referenced in ApplicationsPage.tsx
  freelancer_profiles?: {
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    skills?: string[];
    years_experience?: number;
    portfolio_links?: string[];
    education?: string;
  };
}

// Add Contract interface
export interface Contract {
  id: string;
  job_id: string;
  client_id: string;
  freelancer_id: string;
  rate: number;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
  job?: {
    id: string;
    title: string;
  };
  client?: {
    full_name?: string;
    avatar_url?: string;
  };
  freelancer?: {
    full_name?: string;
    avatar_url?: string;
  };
  jobs?: {
    title?: string;
    id?: string;
    description?: string;
    budget_type?: string;
  };
  profiles?: {
    client_id?: {
      full_name?: string;
      avatar_url?: string;
    };
    freelancer_id?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

// Add ProjectInquiry interface
export interface ProjectInquiry {
  id: string;
  client_id: string;
  freelancer_id: string;
  project_description: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
  client_name?: string;
  client_avatar?: string;
  freelancer_name?: string;
  freelancer_avatar?: string;
}

// Add ChatMessage interface
export interface ChatMessage {
  id: string;
  contract_id: string;
  sender_id: string;
  message: string;
  image_url?: string; // Add support for image URLs
  read: boolean;
  created_at?: string;
  profiles?: {
    full_name?: string;
    avatar_url?: string;
  };
}

// Add ProjectSubmission interface for project submissions
export interface ProjectSubmission {
  id: string;
  contract_id: string;
  freelancer_id: string;
  client_id: string;
  submission_notes?: string;
  submission_files?: string[];
  submission_date?: string;
  status: 'pending' | 'accepted' | 'rejected';
  feedback?: string;
  created_at?: string;
  updated_at?: string;
}

// Add Payment interface for payments
export interface Payment {
  id: string;
  contract_id: string;
  client_id: string;
  freelancer_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_date?: string;
  created_at?: string;
  updated_at?: string;
}
