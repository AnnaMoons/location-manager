import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  trend, 
  trendUp, 
  icon,
  className 
}: MetricCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border bg-card hover:border-primary/50 transition-colors",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs mt-1",
          trendUp ? "text-green-600" : "text-red-600"
        )}>
          {trendUp ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {trend}
        </div>
      )}
    </div>
  );
}
