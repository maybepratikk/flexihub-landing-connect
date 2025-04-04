
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminAccount } from '@/lib/supabase/admin';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AdminAccountSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{
    email: string | null;
    password: string | null;
  } | null>(null);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    
    try {
      const result = await createAdminAccount();
      
      if (result.success) {
        setAdminCredentials({
          email: result.email,
          password: result.password
        });
        
        toast({
          title: "Success",
          description: "Admin account created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create admin account",
          variant: "destructive",
        });
        
        if (result.email && result.password) {
          setAdminCredentials({
            email: result.email,
            password: result.password
          });
        }
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Admin Account Setup</CardTitle>
        <CardDescription>
          Create a default admin account for testing purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {adminCredentials ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Admin Account Created</h3>
              <div className="space-y-2">
                <p className="text-sm flex justify-between">
                  <span className="font-medium">Email:</span> 
                  <span className="font-mono">{adminCredentials.email}</span>
                </p>
                <p className="text-sm flex justify-between">
                  <span className="font-medium">Password:</span> 
                  <span className="font-mono">{adminCredentials.password}</span>
                </p>
              </div>
              <p className="text-xs text-green-600 mt-3">
                Please save these credentials for future use.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            This will create a default admin account with preset credentials.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateAdmin}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating admin account...
            </>
          ) : (
            'Create Admin Account'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
