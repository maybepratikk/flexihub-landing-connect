
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ClientProfileCardProps {
  profile: any;
}

export function ClientProfileCard({ profile }: ClientProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>
          Your company's information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Company Name:</strong> {profile?.company_name}</p>
        <p><strong>Industry:</strong> {profile?.industry}</p>
        <p><strong>Company Size:</strong> {profile?.company_size}</p>
        <p><strong>Description:</strong> {profile?.company_description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild>
          <Link to="/profile">Update Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
