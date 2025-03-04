
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ContractsTabProps {
  contracts: any[];
}

export function FreelancerContractsTab({ contracts }: ContractsTabProps) {
  const navigate = useNavigate();
  
  const handleNavigateToContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Contracts</CardTitle>
        <CardDescription>
          Active and past contracts with clients
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!contracts || contracts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No contracts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => {
              // Extract job details safely
              const jobDetails = contract.jobs && Array.isArray(contract.jobs) && contract.jobs.length > 0 
                ? contract.jobs[0] 
                : contract.jobs || {};
              
              // Extract client details safely
              const clientDetails = contract.profiles || {};
              
              return (
                <div key={contract.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {jobDetails.title || 'Unnamed Job'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Started {contract.start_date ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true }) : ''}
                      </p>
                      <p className="text-sm">
                        <strong>Client:</strong> {clientDetails.full_name || 'Unknown Client'}
                      </p>
                      <p className="text-sm">
                        <strong>Rate:</strong> ${contract.rate}/{jobDetails.budget_type === 'hourly' ? 'hr' : 'fixed'}
                      </p>
                      <div className="mt-2">
                        <Badge 
                          variant={
                            contract.status === 'active' ? 'secondary' : 
                            contract.status === 'completed' ? 'outline' : 'destructive'
                          }
                        >
                          {contract.status}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleNavigateToContract(contract.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
