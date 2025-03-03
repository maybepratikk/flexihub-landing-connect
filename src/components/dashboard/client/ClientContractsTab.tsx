
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractsList } from './ContractsList';

interface ClientContractsTabProps {
  contracts: any[];
}

export function ClientContractsTab({ contracts }: ClientContractsTabProps) {
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
