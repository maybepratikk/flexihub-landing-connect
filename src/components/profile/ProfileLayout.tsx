
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface ProfileLayoutProps {
  children: ReactNode;
  heading: string;
  description?: string;
}

export function ProfileLayout({ children, heading, description }: ProfileLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {description && (
          <p className="text-muted-foreground mt-2">{description}</p>
        )}
      </div>
      
      <Card className="p-6 shadow-sm">
        {children}
      </Card>
    </div>
  );
}
