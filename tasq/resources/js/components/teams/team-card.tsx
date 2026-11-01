import { Link } from '@inertiajs/react';
import { ListChecks, Users } from 'lucide-react';

import { cn } from '@/lib/utils';
import { type TeamSummary } from '@/types/team';

export function TeamCard({ team }: { team: TeamSummary }) {
    const progress = team.tasks_count === 0 ? 0 : Math.round((team.done_tasks_count / team.tasks_count) * 100);
    const isResponsable = team.role === 'responsable';

    return (
        <Link
            href={route('teams.show', team.id)}
            className="bg-foreground/5 hover:bg-foreground/10 flex flex-col gap-5 rounded-[2rem] p-6 transition-colors"
        >
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-medium">{team.name}</h2>
                <span
                    className={cn(
                        'shrink-0 rounded-full px-3 py-1 text-xs',
                        isResponsable ? 'bg-brand/15 text-brand' : 'bg-foreground/10 text-muted-foreground',
                    )}
                >
                    {isResponsable ? 'Responsable' : 'Collaborateur'}
                </span>
            </div>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                    <Users className="size-4" />
                    {team.members_count}
                </span>
                <span className="flex items-center gap-1.5">
                    <ListChecks className="size-4" />
                    {team.done_tasks_count}/{team.tasks_count}
                </span>
            </div>

            <div className="bg-foreground/10 h-1.5 overflow-hidden rounded-full">
                <div className="bg-brand h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
        </Link>
    );
}