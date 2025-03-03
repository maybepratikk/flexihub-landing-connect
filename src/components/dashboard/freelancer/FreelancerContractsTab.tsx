
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

interface ContractsTabProps {
  contracts: any[];
}

export function FreelancerContractsTab({ contracts }: ContractsTabProps) {
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
                      <strong>Client:</strong> {contract.profiles?.full_name || 'Unknown Client'}
                    </p>
                    <p className="text-sm">
                      <strong>Rate:</strong> ${contract.rate}/{contract.jobs?.budget_type === 'hourly' ? 'hr' : 'fixed'}
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
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/contracts/${contract.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
