
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  title: string;
  value: number | null;
  icon: LucideIcon;
  description: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

interface AdminStatsCardsProps {
  stats: Stat[];
  loading: boolean;
}

export function AdminStatsCards({ stats, loading }: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <>
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value?.toLocaleString() ?? '0'}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <div className="mt-2 flex items-center text-xs">
                  <span 
                    className={cn(
                      "mr-1",
                      stat.changeType === 'increase' ? 'text-green-500' : '', 
                      stat.changeType === 'decrease' ? 'text-red-500' : '',
                      stat.changeType === 'neutral' ? 'text-gray-500' : ''
                    )}
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
