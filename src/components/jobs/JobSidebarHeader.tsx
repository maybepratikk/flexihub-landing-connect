
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface JobSidebarHeaderProps {
  title: string;
  onClose: () => void;
}

export function JobSidebarHeader({ title, onClose }: JobSidebarHeaderProps) {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="text-xl font-bold truncate">{title}</h2>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
