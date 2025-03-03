
interface ApplicationStatusProps {
  status: string;
  compact?: boolean;
}

export function ApplicationStatus({ status, compact = false }: ApplicationStatusProps) {
  let statusColor = '';
  
  switch(status.toLowerCase()) {
    case 'pending':
      statusColor = 'bg-amber-50 text-amber-700';
      break;
    case 'accepted':
      statusColor = 'bg-green-50 text-green-700';
      break;
    case 'rejected':
      statusColor = 'bg-red-50 text-red-700';
      break;
    default:
      statusColor = 'bg-muted';
  }
  
  return (
    <div className={`${compact ? 'px-3 py-2' : 'text-center p-4'} ${statusColor} rounded-lg`}>
      <p className="font-medium capitalize">Application Status: {status}</p>
      {!compact && (
        <p className="text-sm text-muted-foreground mt-1">
          {status.toLowerCase() === 'pending' ? 'Waiting for client review' :
           status.toLowerCase() === 'accepted' ? 'Congratulations! Your application was accepted.' :
           'Application was not selected for this position.'}
        </p>
      )}
    </div>
  );
}
