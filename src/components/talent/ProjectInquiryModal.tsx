
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { createProjectInquiry } from "@/lib/supabase";

const inquirySchema = z.object({
  project_description: z.string().min(20, {
    message: "Project description must be at least 20 characters.",
  }),
});

interface ProjectInquiryModalProps {
  freelancer: any;
  onClose: () => void;
}

export function ProjectInquiryModal({ freelancer, onClose }: ProjectInquiryModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      project_description: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof inquirySchema>) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send an inquiry.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const inquiry = await createProjectInquiry({
        client_id: user.id,
        freelancer_id: freelancer.id,
        project_description: data.project_description,
      });

      if (inquiry) {
        toast({
          title: "Inquiry Sent",
          description: `Your project inquiry has been sent to ${freelancer.full_name}.`,
        });
        onClose();
      } else {
        throw new Error("Failed to send inquiry");
      }
    } catch (error) {
      console.error("Error sending project inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to send project inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Project Inquiry</DialogTitle>
          <DialogDescription>
            Describe your project to {freelancer.full_name}. They'll review your inquiry and decide if they want to chat with you.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="project_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your project, requirements, timeline, and budget..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Inquiry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
