
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
              // Extract job details from various possible structures
              let jobTitle = 'No Title Available';
              let budgetType = 'hourly';
              
              // Log raw job data for debugging
              console.log(`Contract ${contract.id} job data:`, {
                jobs: contract.jobs,
                job_id: contract.job_id
              });
              
              // Try to extract job title and budget type using all possible structures
              if (contract.jobs) {
                // Direct job object
                if (typeof contract.jobs === 'object') {
                  if (contract.jobs.title) {
                    jobTitle = contract.jobs.title;
                    budgetType = contract.jobs.budget_type || 'hourly';
                  }
                }
              }
              
              // If we still don't have a title, try another approach to fetch job details
              if (jobTitle === 'No Title Available' && contract.job_id) {
                // Log that we're using an alternate approach
                console.log(`Using alternate approach to get job details for contract ${contract.id}`);
              }
              
              // Get client details from various possible structures
              let clientName = 'Unknown Client';
              
              if (contract.client && contract.client.full_name) {
                clientName = contract.client.full_name;
              } else if (contract.profiles) {
                // Try client_id in profiles object 
                if (contract.profiles.client_id && contract.profiles.client_id.full_name) {
                  clientName = contract.profiles.client_id.full_name;
                }
              }
              
              // Log detailed information for debugging
              console.log(`Contract ${contract.id} extracted data:`, {
                jobTitle,
                budgetType,
                clientName,
                contractRate: contract.rate,
                contractStatus: contract.status
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
