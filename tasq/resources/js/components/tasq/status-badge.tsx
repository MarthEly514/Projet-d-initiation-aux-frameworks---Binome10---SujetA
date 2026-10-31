import { cn } from '@/lib/utils';
import { type TaskStatus } from '@/types/task';

const statusColors: Record<TaskStatus, string> = {
    a_faire: 'bg-foreground/5 text-muted-foreground',
    en_cours: 'border border-brand text-brand',
    review: 'bg-brand/10 text-brand',
    faite: 'bg-brand text-white',
};

export function StatusBadge({ status, label, className }: { status: TaskStatus; label: string; className?: string }) {
    return <span className={cn('inline-flex h-9 items-center rounded-full px-4 text-sm font-medium', statusColors[status], className)}>{label}</span>;
}
