
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface ContractsListProps {
  contracts: any[];
  onNavigateToContract: (contractId: string) => void;
}

export function ContractsList({ contracts, onNavigateToContract }: ContractsListProps) {
  if (contracts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No contracts found</p>
      </div>
    );
  }

  // Helper function to get the status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'secondary';
      case 'submitted':
        return 'default';
      case 'completed':
        return 'outline';
      case 'terminated':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <div key={contract.id} className="p-4 border rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">
                {contract.jobs?.title || 'Unnamed Job'}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Started {contract.start_date ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true }) : ''}
              </p>
              <p className="text-sm">
                <strong>Freelancer:</strong> {contract.profiles?.full_name || 'Unknown Freelancer'}
              </p>
              <p className="text-sm">
                <strong>Rate:</strong> ${contract.rate}/{contract.jobs?.budget_type === 'hourly' ? 'hr' : 'fixed'}
              </p>
              <div className="mt-2">
                <Badge 
                  variant={getStatusBadgeVariant(contract.status)}
                >
                  {contract.status === 'submitted' ? 'Waiting for review' : contract.status}
                </Badge>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onNavigateToContract(contract.id)}
            >
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
