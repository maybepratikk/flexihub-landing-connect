
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Contract, ProjectSubmission } from '@/lib/supabase';
import { submitProject } from '@/lib/supabase';

interface ProjectSubmissionFormProps {
  contract: Contract;
  onSubmitSuccess: (submission: ProjectSubmission) => void;
  onCancel: () => void;
}

export function ProjectSubmissionForm({ 
  contract, 
  onSubmitSuccess, 
  onCancel 
}: ProjectSubmissionFormProps) {
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract) {
      toast({
        title: "Error",
        description: "Contract information is missing.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submission = await submitProject({
        contract_id: contract.id,
        freelancer_id: contract.freelancer_id,
        client_id: contract.client_id,
        submission_notes: notes,
        submission_files: files.length > 0 ? files : undefined
      });
      
      if (submission) {
        toast({
          title: "Success",
          description: "Project submitted successfully. The client will review your submission.",
          variant: "default",
        });
        onSubmitSuccess(submission);
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting your project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // This would be replaced with an actual file upload component
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is a placeholder for file upload functionality
    // In a real implementation, you'd upload files to storage and get URLs
    if (e.target.files) {
      // Simulate file URLs for now
      const newFiles = Array.from(e.target.files).map(file => 
        `https://example.com/files/${file.name}`
      );
      setFiles([...files, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Submit Project for Completion</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Provide details about your work and any relevant files to help the client review your submission.
        </p>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Submission Notes
        </label>
        <Textarea
          id="notes"
          placeholder="Describe the work you've completed and any special instructions for the client..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[120px]"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Attach Files (Optional)
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
            className="w-full"
          >
            Choose Files
          </Button>
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        
        {files.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-medium">Files:</p>
            <ul className="text-sm space-y-1">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="truncate">{file.split('/').pop()}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Project'}
        </Button>
      </div>
    </form>
  );
}
