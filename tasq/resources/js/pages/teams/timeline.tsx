import { Head } from '@inertiajs/react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Gantt } from '@/components/teams/gantt';
import AppLayout from '@/layouts/app-layout';
import { type ActivityItem, type GanttTask } from '@/types/timeline';

type Props = {
    team: { id: number; name: string };
    tasks: GanttTask[];
    unscheduled_count: number;
    activity: ActivityItem[];
};

export default function TeamTimeline({ team, tasks, unscheduled_count, activity }: Props) {
    return (
        <AppLayout title="Timeline">
            <Head title={`Timeline · ${team.name}`} />

            <section className=" flex flex-col gap-10 p-6">
                <h2 className="font-medium">Planning</h2>

                {tasks.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                        Aucune tâche planifiée. Donnez une date de début et de fin à vos tâches pour les voir ici.
                    </p>
                ) : (
                    <Gantt tasks={tasks} />
                )}

                {unscheduled_count > 0 && (
                    <p className="text-muted-foreground text-sm">{unscheduled_count} tâche(s) sans dates ne figurent pas sur la frise.</p>
                )}
            </section>

            <section className="bg-foreground/5 flex flex-col gap-2 rounded-[2rem] p-6">
                <h2 className="font-medium">Activité récente</h2>

                {activity.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucune activité pour le moment.</p>
                ) : (
                    <ul className="divide-foreground/10 divide-y">
                        {activity.map((a) => (
                            <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                                <span>{a.message}</span>
                                <span className="text-muted-foreground shrink-0">
                                    {formatDistanceToNow(parseISO(a.at), { addSuffix: true, locale: fr })}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </AppLayout>
    );
}