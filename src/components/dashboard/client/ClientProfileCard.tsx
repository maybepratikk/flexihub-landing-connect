
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NavigateFunction } from 'react-router-dom';

interface ClientProfileCardProps {
  profile: any;
  navigate: NavigateFunction;
  loading: boolean;
}

export function ClientProfileCard({ profile, navigate, loading }: ClientProfileCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Your company's information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>
          Your company's information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Company Name:</strong> {profile?.company_name || 'Not specified'}</p>
        <p><strong>Industry:</strong> {profile?.industry || 'Not specified'}</p>
        <p><strong>Company Size:</strong> {profile?.company_size || 'Not specified'}</p>
        <p><strong>Description:</strong> {profile?.company_description || 'Not specified'}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild>
          <Link to="/profile">Update Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
