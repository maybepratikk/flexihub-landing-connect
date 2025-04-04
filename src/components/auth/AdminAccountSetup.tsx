
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminAccount } from '@/lib/supabase/admin';
import { Loader2, Copy, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AdminAccountSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState<{
    email: string | null;
    password: string | null;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      console.log("Starting admin creation process...");
      const result = await createAdminAccount();
      console.log("Admin creation result:", result);
      
      if (result.success) {
        setAdminCredentials({
          email: result.email,
          password: result.password
        });
        
        toast({
          title: "Success",
          description: result.message || "Admin account created successfully",
        });
      } else {
        // Handle existing admin case
        if (result.message?.toLowerCase().includes('already exists')) {
          setAdminCredentials({
            email: 'admin@example.com',
            password: 'Admin123!'
          });
          toast({
            title: "Information",
            description: "Admin account already exists. You can use the default credentials to log in.",
          });
        } else {
          // Handle error
          setError(result.message || "Failed to create admin account");
          toast({
            title: "Error",
            description: result.message || "Failed to create admin account",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const retryAdminCreation = () => {
    setAdminCredentials(null);
    setError(null);
    handleCreateAdmin();
  };

  return (
    <Card className="w-full max-w-md mx-auto border-amber-200 bg-amber-50/30">
      <CardHeader className="bg-amber-100/50 border-b border-amber-200">
        <CardTitle>Admin Account Setup</CardTitle>
        <CardDescription>
          Create a default admin account for testing purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{error}</p>
              <Button 
                variant="outline"
                size="sm"
                onClick={retryAdminCreation}
                className="mt-2"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {adminCredentials ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Admin Account Available</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Email:</span> 
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-white px-2 py-1 rounded border">{adminCredentials.email}</span>
                    <button 
                      onClick={() => copyToClipboard(adminCredentials.email || '', 'Email')}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Copy email"
                    >
                      {copied === 'Email' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Password:</span> 
                  <div className="flex items-center gap-2">
                    <span className="font-mono bg-white px-2 py-1 rounded border">{adminCredentials.password}</span>
                    <button 
                      onClick={() => copyToClipboard(adminCredentials.password || '', 'Password')}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Copy password"
                    >
                      {copied === 'Password' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-green-600 mt-3">
                Please save these credentials for future use.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">
            This will create a default admin account with email <span className="font-mono bg-gray-100 px-1 rounded">admin@example.com</span> and password <span className="font-mono bg-gray-100 px-1 rounded">Admin123!</span>
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleCreateAdmin}
          disabled={isCreating}
          className="w-full"
          variant={adminCredentials ? "outline" : "default"}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating admin account...
            </>
          ) : adminCredentials ? (
            'Create Another Admin Account'
          ) : (
            'Create Admin Account'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
