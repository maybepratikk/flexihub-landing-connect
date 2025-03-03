
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Building, Globe, Briefcase, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ClientOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for form fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to complete onboarding",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert client profile data
      const { error } = await supabase
        .from('client_profiles')
        .insert({
          id: user.id,
          company_name: companyName,
          industry,
          company_size: companySize,
          company_description: companyDescription,
          website,
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile completed!",
        description: "Your client profile has been created successfully.",
      });
      
      // Redirect to dashboard after successful onboarding
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error in client onboarding:', error);
      toast({
        title: "Error creating profile",
        description: error.message || "Failed to create client profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Complete Your Client Profile</CardTitle>
        <CardDescription>
          Provide details about your company to help freelancers understand your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Building className="h-5 w-5" />
              </div>
              <Input
                id="companyName"
                placeholder="Your company name"
                className="pl-10"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Briefcase className="h-5 w-5" />
                </div>
                <Input
                  id="industry"
                  placeholder="E.g. Technology, Healthcare"
                  className="pl-10"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                  <Building className="h-5 w-5" />
                </div>
                <Input
                  id="companySize"
                  placeholder="E.g. 1-10, 11-50, 51-200"
                  className="pl-10"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyDescription">Company Description</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pt-3 pointer-events-none text-gray-400">
                <Info className="h-5 w-5" />
              </div>
              <Textarea
                id="companyDescription"
                placeholder="Describe your company, mission, and values"
                className="pl-10 min-h-[100px]"
                value={companyDescription}
                onChange={(e) => setCompanyDescription(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Company Website</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Globe className="h-5 w-5" />
              </div>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                className="pl-10"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className={cn("w-full mt-6", isSubmitting ? "opacity-70" : "")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>Complete Profile</>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        You can update this information later from your profile settings
      </CardFooter>
    </Card>
  );
}
