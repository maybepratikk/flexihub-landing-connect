
import { supabase } from './client';

export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllUsers:', err);
    return [];
  }
}

export async function getAllJobs() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, profiles:client_id(*)');
    
    if (error) {
      console.error('Error fetching all jobs:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllJobs:', err);
    return [];
  }
}

export async function getAllApplications() {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_id(*),
        freelancer:freelancer_id(*)
      `);
    
    if (error) {
      console.error('Error fetching all applications:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllApplications:', err);
    return [];
  }
}

export async function getAllContracts() {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        client:client_id(*),
        freelancer:freelancer_id(*),
        job:job_id(*)
      `);
    
    if (error) {
      console.error('Error fetching all contracts:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Exception in getAllContracts:', err);
    return [];
  }
}

// Check if a user has admin privileges
export async function checkAdminStatus(userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_access')
      .select('access_level')
      .eq('admin_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error checking admin status:', error);
      return { isAdmin: false, accessLevel: null };
    }
    
    return {
      isAdmin: !!data,
      accessLevel: data?.access_level || null
    };
  } catch (err) {
    console.error('Exception in checkAdminStatus:', err);
    return { isAdmin: false, accessLevel: null };
  }
}

// Create a new admin account with default credentials
export async function createAdminAccount() {
  try {
    console.log("Starting admin account creation process");
    // First check if the admin user already exists
    const { data: existingUser, error: checkError } = await supabase.auth
      .signInWithPassword({
        email: 'admin@example.com',
        password: 'Admin123!'
      });
    
    if (existingUser && existingUser.user) {
      console.log('Admin user already exists and can be signed in');
      
      // Check if admin access is granted
      const { data: adminAccess } = await supabase
        .from('admin_access')
        .select('*')
        .eq('admin_id', existingUser.user.id)
        .maybeSingle();
      
      if (!adminAccess) {
        // Grant admin privileges if not already granted
        const { error: accessError } = await supabase
          .from('admin_access')
          .insert([
            { admin_id: existingUser.user.id, access_level: 'standard' }
          ]);
          
        if (accessError) {
          console.error('Error granting admin privileges to existing user:', accessError);
        } else {
          console.log('Admin privileges granted to existing user');
        }
      }
      
      return {
        success: true,
        message: 'Admin account already exists. You can use the default credentials to log in.',
        email: 'admin@example.com',
        password: 'Admin123!'
      };
    }
    
    console.log("Creating new admin user account");
    // Sign up a new admin user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'Admin123!',
      options: {
        data: {
          full_name: 'Admin User',
          user_type: 'admin'
        },
        emailRedirectTo: `${window.location.origin}/signin`
      }
    });
    
    if (authError) {
      console.error('Error creating admin user:', authError);
      return {
        success: false,
        message: authError.message,
        email: 'admin@example.com',
        password: 'Admin123!'
      };
    }
    
    if (!authData.user) {
      console.error('No user returned from sign up');
      return {
        success: false,
        message: 'Failed to create admin user',
        email: null,
        password: null
      };
    }
    
    console.log("Admin user created successfully, now granting admin privileges");
    
    // Grant admin privileges
    const { error } = await supabase
      .from('admin_access')
      .insert([
        { admin_id: authData.user.id, access_level: 'standard' }
      ]);
      
    if (error) {
      console.error('Error granting admin privileges:', error);
      return {
        success: false,
        message: `Admin user created but failed to grant admin privileges: ${error.message}`,
        email: 'admin@example.com',
        password: 'Admin123!'
      };
    }
    
    console.log(`Admin account created successfully: admin@example.com`);
    return {
      success: true,
      message: 'Admin account created successfully',
      email: 'admin@example.com',
      password: 'Admin123!'
    };
  } catch (err: any) {
    console.error('Exception in createAdminAccount:', err);
    return {
      success: false,
      message: err.message || 'Unknown error',
      email: 'admin@example.com',
      password: 'Admin123!'
    };
  }
}

// Create a test admin user (for development purposes)
export async function createTestAdmin(email: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_access')
      .insert([
        { admin_id: userId, access_level: 'standard' }
      ])
      .select();
      
    if (error) {
      console.error('Error creating test admin:', error);
      return false;
    }
    
    console.log(`Admin privileges granted to ${email}`);
    return true;
  } catch (err) {
    console.error('Exception in createTestAdmin:', err);
    return false;
  }
}
