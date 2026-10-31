import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/tasq/button';
import { StatusBadge } from '@/components/tasq/status-badge';
import { type Task } from '@/types/task';

interface TaskCardProps {
    task: Task;
    canManage: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

function formatDate(date: string): string {
    return date.split('-').reverse().join('/');
}

export default function TaskCard({ task, canManage, onEdit, onDelete }: TaskCardProps) {
    return (
        <li className="bg-foreground/5 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[2rem] p-8">
            <div className="min-w-0 flex-1 basis-64 space-y-2">
                <p className="text-[16px] font-medium [overflow-wrap:anywhere]">{task.name}</p>
                <p className="text-muted-foreground text-sm">
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
