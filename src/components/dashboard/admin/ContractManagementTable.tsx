
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

interface Contract {
  id: string;
  job_id: string;
  freelancer_id: string;
  client_id: string;
  rate: number;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  jobs?: {
    title?: string;
  }
}

interface ContractManagementTableProps {
  contracts: Contract[];
  loading?: boolean;
}

export function ContractManagementTable({ contracts, loading = false }: ContractManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredContracts = contracts.filter(contract => 
    contract.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.id.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search contracts..."
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
              <TableHead>Job Title</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No contracts found
                </TableCell>
              </TableRow>
            ) : (
              filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">
                    {contract.jobs?.title || 'Unknown Job'}
                  </TableCell>
                  <TableCell>${contract.rate}</TableCell>
                  <TableCell>
                    <Badge variant={
                      contract.status === 'active' 
                        ? 'secondary' 
                        : contract.status === 'completed' 
                          ? 'default' 
                          : 'destructive'
                    }>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{contract.start_date ? new Date(contract.start_date).toLocaleDateString() : 'Unknown'}</TableCell>
                  <TableCell>{contract.end_date ? new Date(contract.end_date).toLocaleDateString() : 'Ongoing'}</TableCell>
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
                        <DropdownMenuItem>View Messages</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Terminate Contract</DropdownMenuItem>
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
