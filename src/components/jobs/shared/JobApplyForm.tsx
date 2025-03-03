
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';

const applicationSchema = z.object({
  cover_letter: z.string().min(10, {
    message: "Cover letter must be at least 10 characters.",
  }),
  pitch: z.string().min(10, {
    message: "Pitch must be at least 10 characters.",
  }),
  proposed_rate: z.coerce.number().min(5, {
    message: "Proposed rate must be at least $5.",
  }),
  phone: z.string().min(5, {
    message: "Phone number is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplyFormProps {
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
  budgetType: 'fixed' | 'hourly';
  defaultEmail?: string;
}

export function JobApplyForm({ onSubmit, onCancel, budgetType, defaultEmail = '' }: JobApplyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      cover_letter: "",
      pitch: "",
      proposed_rate: 0,
      phone: "",
      email: defaultEmail || "",
    },
  });

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting application data:", data);
      await onSubmit(data);
      console.log("Application submitted successfully");
    } catch (error) {
      console.error("Error submitting application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cover_letter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Introduce yourself and explain why you're interested in this job."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="pitch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pitch Yourself</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your relevant experience and why you're the best fit for this job. Include links to your portfolio or previous work."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="proposed_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposed Rate {budgetType === 'hourly' ? '(per hour)' : '(fixed)'}</FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <Input type="number" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} defaultValue={defaultEmail} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This information will only be shared with the client if your application is accepted.
          </p>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
