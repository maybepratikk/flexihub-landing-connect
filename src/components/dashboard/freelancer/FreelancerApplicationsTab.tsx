
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationsTabProps {
  applications: any[];
  contracts: any[];
}

export function FreelancerApplicationsTab({ applications, contracts }: ApplicationsTabProps) {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications</CardTitle>
        <CardDescription>
          Jobs you've applied for
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!applications || applications.length === 0 ? (
          <div className="text-center py-6">
            <FileCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/jobs')}>
              Find Jobs to Apply
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              // Get job title safely, checking all possible paths
              const jobTitle = application.jobs?.title || 
                               (application.job && application.job.title) ||
                               'Unnamed Job';
              
              // Get job budget type safely
              const budgetType = application.jobs?.budget_type || 
                                (application.job && application.job.budget_type) || 
                                'hourly';
              
              // Find the corresponding contract
              const contract = contracts.find(c => c.job_id === application.job_id);
              
              return (
                <div key={application.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        <Link to={`/jobs/${application.job_id}`} className="hover:underline">
                          {jobTitle}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Applied {application.created_at ? formatDistanceToNow(new Date(application.created_at), { addSuffix: true }) : ''}
                      </p>
                      <p className="text-sm">
                        <strong>Proposed Rate:</strong> ${application.proposed_rate}/{budgetType === 'hourly' ? 'hr' : 'fixed'}
                      </p>
                      <div className="mt-2">
                        <Badge 
                          variant={
                            application.status === 'pending' ? 'secondary' : 
                            application.status === 'accepted' ? 'default' : 'destructive'
                          }
                        >
                          {application.status === 'pending' ? 'Pending' : 
                           application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                        </Badge>
                      </div>
                    </div>
                    
                    {application.status === 'accepted' && contract && (
                      <Button 
                        size="sm" 
                        onClick={() => {
                          navigate(`/contracts/${contract.id}`);
                        }}
                      >
                        View Contract
                      </Button>
                    )}
                  </div>
                  
                  {/* Show client contact info for accepted applications */}
                  {application.status === 'accepted' && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold mb-2">Client Contact Information</h4>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Use the contract page to message your client</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your application has been accepted! A contract has been created for this job.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
