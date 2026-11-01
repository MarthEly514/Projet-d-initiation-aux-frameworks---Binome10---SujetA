import { Link } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/tasq/button';
import { StatusBadge } from '@/components/tasq/status-badge';
import { type Task } from '@/types/task';

interface TaskCardProps {
    task: Task;
    canManage?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function formatDate(date: string): string {
    return date.split('-').reverse().join('/');
}

export default function TaskCard({ task, canManage = false, onEdit, onDelete }: TaskCardProps) {
    return (
        <li className="bg-foreground/5 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[2rem] p-8">
            <div className="min-w-0 flex-1 basis-64 space-y-2">
                <Link href={route('tasks.show', task.id)} className="hover:text-brand block text-[16px] font-medium transition-colors [overflow-wrap:anywhere]">
                    {task.name}
                </Link>
                <p className="text-muted-foreground text-sm">
                    {task.team && `${task.team.name} · `}
                    {task.lead?.name ?? 'Sans responsable'}
                    {task.end_date && ` · Échéance le ${formatDate(task.end_date)}`}
                </p>
            </div>

            <StatusBadge status={task.status} label={task.status_label} />

            {canManage && (
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" aria-label={`Modifier ${task.name}`} onClick={onEdit}>
                        <Pencil />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Supprimer ${task.name}`} onClick={onDelete}>
                        <Trash2 />
                    </Button>
                </div>
            )}
        </li>
    );
}
