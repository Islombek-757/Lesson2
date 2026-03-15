import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  color?: string;
}

export default function StatsCard({ title, value, icon: Icon, change, color = 'text-indigo-500' }: StatsCardProps) {
  return (
    <div className="glass rounded-2xl p-6 card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)] mb-2">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {change && (
            <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
