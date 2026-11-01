import { Link } from '@inertiajs/react';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ListChecks, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/tasq/button';
import { DropdownMenuContent, DropdownMenuItem } from '@/components/tasq/dropdown-menu';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type Task, type TaskMember } from '@/types/task';

const MAX_AVATARS = 3;

function formatRange(start: string | null, end: string | null) {
    if (!start && !end) return 'Sans dates';
    if (start && end && start !== end) {
        const s = parseISO(start);
        const e = parseISO(end);
        const sameMonth = format(s, 'MM yyyy') === format(e, 'MM yyyy');
        return sameMonth
            ? `${format(s, 'd')} → ${format(e, 'd MMM', { locale: fr })}`
            : `${format(s, 'd MMM', { locale: fr })} → ${format(e, 'd MMM', { locale: fr })}`;
    }
    return format(parseISO((start ?? end) as string), 'd MMM', { locale: fr });
}

type Props = {
    task: Task;
    color: string;
    isDone: boolean;
    canManage: boolean;
    onEdit: () => void;
    onDelete: () => void;
};

export function TaskBoardCard({ task, color, isDone, canManage, onEdit, onDelete }: Props) {
    const getInitials = useInitials();

    const end = task.end_date ? parseISO(task.end_date) : null;
    const overdue = !isDone && end !== null && isPast(end) && !isToday(end);

    // Lead first, then the collaborators
    const assignees = [task.lead, ...task.collaborators].filter((m): m is TaskMember => m !== null);
    const shown = assignees.slice(0, MAX_AVATARS);
    const extra = assignees.length - shown.length;

    const total = task.steps_count ?? 0;
    const done = task.done_steps_count ?? 0;

    return (
        <li className="bg-foreground/5 hover:bg-foreground/[0.08] relative flex flex-col gap-4 rounded-[1.5rem] p-5 pl-7 transition-colors">
            <span className="absolute top-5 bottom-5 left-3 w-1 rounded-full" style={{ backgroundColor: color }} />

            <div className="flex items-center justify-between gap-2">
                <span className={cn('text-xs', overdue ? 'text-destructive' : 'text-muted-foreground')}>
                    {formatRange(task.start_date, task.end_date)}
                </span>

                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative z-10 -my-2 -mr-2 size-8" aria-label="Actions">
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={onEdit}>
                                <Pencil />
                                Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={onDelete}>
                                <Trash2 />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Whole card clickable (stretched link), the menu stays above it */}
            <Link href={route('tasks.show', task.id)} className="line-clamp-3 text-sm font-medium after:absolute after:inset-0">
                {task.name}
            </Link>

            <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    <ListChecks className="size-4" />
                    {total > 0 ? `${done}/${total}` : '–'}
                </span>

                {assignees.length > 0 && (
                    <AvatarGroup>
                        {shown.map((a) => (
                            <Avatar
                                key={a.id}
                                className="size-7"
                                title={a.id === task.lead?.id ? `${a.name} · responsable` : a.name
                                }>
                                <AvatarFallback className="text-[10px]">{getInitials(a.name)}</AvatarFallback>
                            </Avatar>
                        ))}
                        {extra > 0 && <AvatarGroupCount className="size-7 text-[10px]">+{extra}</AvatarGroupCount>}
                    </AvatarGroup>
                )}
            </div>
        </li>
    );
}