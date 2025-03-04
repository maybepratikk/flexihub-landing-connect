
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractsList } from './ContractsList';
import { useNavigate } from 'react-router-dom';

interface ClientContractsTabProps {
  contracts: any[];
  loading?: boolean;
}

export function ClientContractsTab({ contracts, loading }: ClientContractsTabProps) {
  const navigate = useNavigate();
  
  const handleNavigateToContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Contracts</CardTitle>
        <CardDescription>
          Active and past contracts with freelancers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContractsList 
          contracts={contracts} 
          onNavigateToContract={handleNavigateToContract} 
        />
      </CardContent>
    </Card>
  );
}
