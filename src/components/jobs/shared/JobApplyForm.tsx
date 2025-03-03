
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

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
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplyFormProps {
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  onCancel: () => void;
  budgetType: 'fixed' | 'hourly';
}

export function JobApplyForm({ onSubmit, onCancel, budgetType }: JobApplyFormProps) {
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      cover_letter: "",
      pitch: "",
      proposed_rate: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Submit Application
          </Button>
        </div>
      </form>
    </Form>
  );
}
