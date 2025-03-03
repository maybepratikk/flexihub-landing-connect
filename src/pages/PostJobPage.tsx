
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createJob } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';

// Job categories
const jobCategories = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data Science",
  "DevOps",
  "Project Management",
  "Customer Support",
  "Other"
];

// Form schema
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(30, { message: "Description must be at least 30 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  skills_required: z.string().min(1, { message: "Please enter at least one skill" }),
  budget_min: z.coerce.number().min(1, { message: "Minimum budget is required" }),
  budget_max: z.coerce.number().min(1, { message: "Maximum budget is required" }),
  budget_type: z.enum(["fixed", "hourly"]),
  duration: z.enum(["short", "medium", "long"]),
  experience_level: z.enum(["entry", "intermediate", "expert"])
});

type FormValues = z.infer<typeof formSchema>;

const PostJobPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      skills_required: "",
      budget_min: undefined,
      budget_max: undefined,
      budget_type: "fixed",
      duration: "medium",
      experience_level: "intermediate"
    }
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to post a job",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Convert skills string to array
      const skills = values.skills_required
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
      
      const jobData = {
        ...values,
        client_id: user.id,
        skills_required: skills,
        status: 'open'
      };
      
      const result = await createJob(jobData);
      
      if (result) {
        toast({
          title: "Success!",
          description: "Your job has been posted successfully",
        });
        navigate(`/jobs/${result.id}`);
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error: any) {
      console.error("Error posting job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post job",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Post a New Job</h1>
            <p className="text-muted-foreground">Find the perfect freelancer for your project</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Provide detailed information to attract qualified freelancers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. WordPress Website Development" {...field} />
                        </FormControl>
                        <FormDescription>
                          A clear and concise title for your job
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your project, requirements, deliverables, etc." 
                            className="min-h-[150px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Provide detailed information about your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {jobCategories.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the most relevant category
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Experience Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="entry">Entry Level</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The experience level required for this job
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="skills_required"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Required Skills</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. React, Node.js, UI Design (comma-separated)" {...field} />
                        </FormControl>
                        <FormDescription>
                          List skills required for the job (separated by commas)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="hourly">Hourly Rate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How do you want to pay for this job?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Duration</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select project duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="short">Short Term (< 1 month)</SelectItem>
                              <SelectItem value="medium">Medium Term (1-3 months)</SelectItem>
                              <SelectItem value="long">Long Term (3+ months)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Estimated project duration
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="budget_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Budget ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget_max"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Budget ($)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md flex gap-2">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-300">Important</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        Be as specific as possible in your job description to attract qualified freelancers.
                        Clear requirements help you get better proposals.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting Job...
                        </>
                      ) : (
                        "Post Job"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PostJobPage;
