
interface ApplicationStatusProps {
  status: string;
  compact?: boolean;
}

export function ApplicationStatus({ status, compact = false }: ApplicationStatusProps) {
  return (
    <div className={`text-${compact ? '' : 'center'} p-4 bg-muted rounded-lg`}>
      <p className="font-medium">Application Status: {status}</p>
      <p className="text-sm text-muted-foreground mt-1">
        {status === 'pending' ? 'Waiting for client review' :
         status === 'accepted' ? 'Congratulations! Your application was accepted.' :
         'Application was not selected for this position.'}
      </p>
    </div>
  );
}
