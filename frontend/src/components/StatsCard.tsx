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
    <div className="rounded-2xl p-5 border border-black/10 dark:border-white/10 bg-[var(--card)] shadow-[0_10px_30px_rgba(15,23,42,0.08)] card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted-foreground)] mb-2">{title}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
          {change && (
            <p className="text-sm text-green-500 mt-2 flex items-center gap-1">
              <TrendingUp size={14} />
              {change}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
