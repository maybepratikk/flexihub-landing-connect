
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ProfileCardProps {
  profile: any;
}

export function FreelancerProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Overview</CardTitle>
        <CardDescription>
          Your professional profile information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p><strong>Hourly Rate:</strong> ${profile?.hourly_rate}/hr</p>
        <p><strong>Experience:</strong> {profile?.years_experience} years</p>
        <p><strong>Skills:</strong> {profile?.skills?.join(', ')}</p>
        <p><strong>Availability:</strong> {profile?.availability}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild>
          <Link to="/profile">Update Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
