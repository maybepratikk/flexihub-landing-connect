
import { useState, useEffect } from 'react';
import { getAllUsers } from '@/lib/supabase/admin';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreVertical, Search, UserX, UserCog, UserCheck, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: string;
  created_at?: string;
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.user_type?.toLowerCase().includes(searchLower)
    );
  });

  const makeAdmin = async (userId: string) => {
    try {
      // Call the RPC function we created in SQL
      const { error } = await supabase.rpc('set_admin', { 
        target_user_id: userId,
        admin_level: 'standard'
      });
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'User has been granted admin access',
      });
      
      // Reload users to see changes
      loadUsers();
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to grant admin privileges',
        variant: 'destructive'
      });
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_access')
        .delete()
        .eq('admin_id', userId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Admin privileges revoked',
      });
      
      // Reload users to see changes
      loadUsers();
    } catch (error) {
      console.error('Error removing admin privileges:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove admin privileges',
        variant: 'destructive'
      });
    }
  };

  const banUser = async (userId: string) => {
    // In a real implementation, this would disable the user account
    toast({
      title: 'Not Implemented',
      description: 'User banning functionality is not yet implemented',
    });
  };
  
  // Check if a user is an admin
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('admin_access')
        .select('id')
        .eq('admin_id', userId)
        .maybeSingle();
        
      return !!data;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users Management</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={loadUsers}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-2">Loading users...</p>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.full_name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.user_type || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{
                    user.created_at ? 
                      new Date(user.created_at).toLocaleDateString() : 
                      'Unknown'
                  }</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => makeAdmin(user.id)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => removeAdmin(user.id)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Remove Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => banUser(user.id)}>
                          <UserX className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default UsersPage;
