
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
  
  // Debug log to inspect contracts data structure
  console.log("Contracts in FreelancerContractsTab:", contracts);
  
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
              // Get job details, ensuring we handle all possible structures
              let jobTitle = 'No Title Available';
              let budgetType = 'hourly';
              
              // Try to extract job details from different possible structures
              if (contract.jobs) {
                // Check if jobs is an object with title property
                if (typeof contract.jobs === 'object' && contract.jobs.title) {
                  jobTitle = contract.jobs.title;
                  budgetType = contract.jobs.budget_type || 'hourly';
                }
              }
              
              // Get client details from various possible structures
              const clientName = contract.client?.full_name || 
                                 contract.profiles?.client_id?.full_name || 
                                 'Unknown Client';
              
              // Log detailed information for debugging
              console.log(`Contract ${contract.id}:`, {
                jobData: contract.jobs,
                clientData: contract.client,
                profiles: contract.profiles,
                extractedTitle: jobTitle,
                extractedBudgetType: budgetType,
                extractedClientName: clientName
              });
              
              return (
                <div key={contract.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {jobTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Started {contract.start_date ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true }) : ''}
                      </p>
                      <p className="text-sm">
                        <strong>Client:</strong> {clientName}
                      </p>
                      <p className="text-sm">
                        <strong>Rate:</strong> ${contract.rate}/{budgetType === 'hourly' ? 'hr' : 'fixed'}
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
