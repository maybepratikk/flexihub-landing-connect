
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
import { MoreHorizontal, Search } from 'lucide-react';

interface User {
  id: string;
  full_name?: string;
  email: string;
  user_type?: string;
  avatar_url?: string;
  created_at?: string;
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
    user.user_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Search users..."
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
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                    }>
                      {user.user_type || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
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
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
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
