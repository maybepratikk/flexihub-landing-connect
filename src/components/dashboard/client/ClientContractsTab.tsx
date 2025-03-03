
import { NavigateFunction } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContractsList } from './ContractsList';

interface ClientContractsTabProps {
  contracts: any[];
  loading?: boolean;
}

export function ClientContractsTab({ contracts, loading }: ClientContractsTabProps) {
  const handleNavigateToContract = (contractId: string) => {
    window.location.href = `/contracts/${contractId}`;
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
