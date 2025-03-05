
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Building, User, Shield } from 'lucide-react';

interface User {
  id: string;
  full_name?: string;
  email: string;
  user_type?: string;
  avatar_url?: string;
  created_at?: string;
  client_profiles?: {
    company_name?: string;
    industry?: string;
  };
  freelancer_profiles?: {
    skills?: string[];
    hourly_rate?: number;
  };
}

interface UserManagementTableProps {
  users: User[];
  loading?: boolean;
}

export function UserManagementTable({ users, loading = false }: UserManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.client_profiles?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.client_profiles?.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.freelancer_profiles?.skills?.some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getUserTypeIcon = (userType: string | undefined) => {
    switch(userType) {
      case 'admin':
        return <Shield className="h-4 w-4 mr-2 text-red-500" />;
      case 'client':
        return <Building className="h-4 w-4 mr-2 text-blue-500" />;
      case 'freelancer':
        return <User className="h-4 w-4 mr-2 text-green-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, type, or skills..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback>
                          {user.full_name?.charAt(0) || user.email.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.user_type === 'admin' 
                        ? 'destructive' 
                        : user.user_type === 'freelancer' 
                          ? 'secondary' 
                          : 'default'
                    } className="flex items-center w-fit">
                      {getUserTypeIcon(user.user_type)}
                      {user.user_type || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.user_type === 'client' && user.client_profiles && (
                      <span className="text-xs">
                        {user.client_profiles.company_name && (
                          <span className="block">{user.client_profiles.company_name}</span>
                        )}
                        {user.client_profiles.industry && (
                          <span className="block text-muted-foreground">{user.client_profiles.industry}</span>
                        )}
                      </span>
                    )}
                    {user.user_type === 'freelancer' && user.freelancer_profiles && (
                      <span className="text-xs">
                        {user.freelancer_profiles.hourly_rate && (
                          <span className="block">${user.freelancer_profiles.hourly_rate}/hr</span>
                        )}
                        {user.freelancer_profiles.skills && user.freelancer_profiles.skills.length > 0 && (
                          <span className="block text-muted-foreground">
                            {user.freelancer_profiles.skills.slice(0, 2).join(', ')}
                            {user.freelancer_profiles.skills.length > 2 && '...'}
                          </span>
                        )}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        {user.user_type !== 'admin' && (
                          <DropdownMenuItem>Promote to Admin</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
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
