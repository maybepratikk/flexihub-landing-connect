
import { useState, useEffect } from 'react';
import { getAllContracts } from '@/lib/supabase/admin';
import { Contract } from '@/lib/supabase/types';
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
import { Loader2, MoreVertical, Search, Eye, XCircle, AlertOctagon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const loadContracts = async () => {
    setLoading(true);
    try {
      const contractsData = await getAllContracts();
      setContracts(contractsData);
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contracts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const filteredContracts = contracts.filter(contract => {
    const searchLower = searchQuery.toLowerCase();
    return (
      contract.jobs?.title?.toLowerCase().includes(searchLower) ||
      contract.client?.full_name?.toLowerCase().includes(searchLower) ||
      contract.freelancer?.full_name?.toLowerCase().includes(searchLower) ||
      contract.status.toLowerCase().includes(searchLower)
    );
  });

  const updateContractStatus = async (contractId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .update({ status })
        .eq('id', contractId);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Contract status updated to ${status}`,
      });
      
      // Update local state
      setContracts(prevContracts => 
        prevContracts.map(contract => 
          contract.id === contractId ? { ...contract, status } : contract
        )
      );
    } catch (error) {
      console.error('Error updating contract status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contract status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contracts Management</h1>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={loadContracts}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Freelancer</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-muted-foreground mt-2">Loading contracts...</p>
                </TableCell>
              </TableRow>
            ) : filteredContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <p className="text-muted-foreground">No contracts found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredContracts.map(contract => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {contract.jobs?.title || 'Unknown Job'}
                  </TableCell>
                  <TableCell>{contract.client?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{contract.freelancer?.full_name || 'Unknown'}</TableCell>
                  <TableCell>${contract.rate}/hr</TableCell>
                  <TableCell>
                    <Badge className={
                      contract.status === 'active' ? 'bg-green-100 text-green-800' :
                      contract.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      contract.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/contracts/${contract.id}`} className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateContractStatus(contract.id, 'cancelled')}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Contract
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateContractStatus(contract.id, 'disputed')}>
                          <AlertOctagon className="mr-2 h-4 w-4" />
                          Flag Dispute
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

export default ContractsPage;
