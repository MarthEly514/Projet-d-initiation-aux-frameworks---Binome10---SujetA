import { Head, Link } from '@inertiajs/react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type MemberWorkload, type OverviewTask, type StatusCount } from '@/types/overview';
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import { Button } from '@/components/tasq/button';
import { useInitials } from '@/hooks/use-initials';


type Props = {
    team: { id: number; name: string };
    statuses: StatusCount[];
    total: number;
    progress: number;
    overdue_count: number;
    overdue_tasks: OverviewTask[];
    review_tasks: OverviewTask[];
    workload: MemberWorkload[];
};

const COLORS: Record<StatusCount['key'], string> = {
    a_faire: '#9f5bfe',
    en_cours: '#1a8fe8',
    review: '#f14f1e',
    faite: '#0ace82',
};

const formatDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : 'Sans échéance');

function TaskList({ title, tasks, empty, danger }: { title: string; tasks: OverviewTask[]; empty: string; danger?: boolean }) {
    return (
        <section className="bg-foreground/5 flex flex-col gap-3 rounded-[2rem] p-6">
            <h2 className="font-medium">{title}</h2>
            {tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">{empty}</p>
            ) : (
                <ul className="divide-foreground/10 divide-y">
                    {tasks.map((t) => (
                        <li key={t.id}>
                            <Link href={route('tasks.show', t.id)} className="flex items-center justify-between gap-4 py-3">
                                <span className="truncate">{t.name}</span>
                                <span className={cn('shrink-0 text-sm', danger ? 'text-destructive' : 'text-muted-foreground')}>
                                    {formatDate(t.end_date)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function TeamOverview({ team, statuses, total, progress, overdue_count, overdue_tasks, review_tasks, workload }: Props) {
    const getInitials = useInitials();
    const MAX_AVATARS = 5;
    const shown = workload.slice(0, MAX_AVATARS);
    const extra = workload.length - shown.length;

    return (
        <AppLayout title="Overview">
            <Head title={`Overview · ${team.name}`} />

            {/* Counters */}
            <div>
                <span className="flex mb-4 text-sm">Tâches</span>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {statuses.map((s) => (
                        <div key={s.key} className="bg-foreground/5 rounded-[2rem] p-6 relative">
                            {/* <span className="w-2.5 h-16 rounded-full absolute right-1 top-1/2 -translate-y-1/2 opacity-65" style={{ backgroundColor: COLORS[s.key] }} /> */}
                            <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                {s.label}
                            </p>
                            <p className="mt-2 text-3xl font-semibold">{s.count}</p>
                        </div>
                    ))}
                    <div className="bg-foreground/5 rounded-[2rem] p-6">
                        <p className="text-muted-foreground text-sm">En retard</p>
                        <p className={cn('mt-2 text-3xl font-semibold', overdue_count > 0 && 'text-destructive')}>{overdue_count}</p>
                    </div>
                </div>
            </div>

            {/* Members overview */}
            <div>
                <span className="mb-4 flex text-sm">Équipe</span>
                <div className="flex flex-wrap items-center gap-4">
                    <AvatarGroup>
                        {shown.map((m) => (
                            <Avatar key={m.id} title={m.name}>
                                <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                            </Avatar>
                        ))}
                        {extra > 0 && <AvatarGroupCount>+{extra}</AvatarGroupCount>}
                    </AvatarGroup>

                    <Button asChild variant="ghost" size="sm">
                        <Link href={route('teams.members.index', team.id)}>Voir les membres</Link>
                    </Button>
                </div>
            </div>

            {/* Chart + progress */}
            <div className="grid gap-4 lg:grid-cols-2">
                <section className="bg-foreground/5 flex flex-col gap-4 rounded-[2rem] p-6">
                    <h2 className="font-medium">Répartition des tâches</h2>
                    {total === 0 ? (
                        <p className="text-muted-foreground py-10 text-center text-sm">Aucune tâche pour le moment.</p>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statuses} dataKey="count" nameKey="label" innerRadius={55} outerRadius={85} paddingAngle={2} stroke="none">
                                        {statuses.map((s) => (
                                            <Cell key={s.key} fill={COLORS[s.key]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        layout='vertical'
                                        verticalAlign='middle'
                                        align='right'
                                        iconType="circle"
                                        iconSize={10}
                                        formatter={(value, entry) => (
                                            <span className="text-foreground/50 text-sm">
                                                {value} ({(entry.payload as { count?: number })?.count ?? 0})
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </section>

                <section className="bg-foreground/5 flex flex-col justify-start gap-4 rounded-[2rem] p-6">
                    <h2 className="font-medium">Avancement global</h2>
                    <div className='flex flex-col gap-4'>
                        <p className="text-5xl lg:text-7xl font-semibold">{progress}%</p>
                        <div className="bg-foreground/10 h-2 lg:h-3 overflow-hidden rounded-full">
                            <div className="bg-brand h-full rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {statuses.find((s) => s.key === 'faite')?.count ?? 0} tâche(s) terminée(s) sur {total}.
                        </p>
                    </div>
                </section>
            </div>

            {/* Lists */}
            <div className="grid gap-4 lg:grid-cols-2">
                <TaskList title="En retard" tasks={overdue_tasks} empty="Aucune tâche en retard." danger />
                <TaskList title="En attente de validation" tasks={review_tasks} empty="Rien à valider pour le moment." />
            </div>

            {/* Workload */}
            <section className="bg-foreground/5 flex flex-col gap-4 rounded-[2rem] p-6">
                <h2 className="font-medium">Charge par membre</h2>
                <ul className="flex flex-col gap-4">
                    {workload.map((m) => {
                        const all = m.open_count + m.done_count;
                        const pct = all === 0 ? 0 : Math.round((m.done_count / all) * 100);
                        return (
                            <li key={m.id} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <span>
                                        {m.name}
                                        {m.role === 'responsable' && <span className="text-muted-foreground"> · responsable</span>}
                                    </span>
                                    <span className="text-muted-foreground">
                                        {m.open_count} en cours · {m.done_count} terminée(s)
                                    </span>
                                </div>
                                <div className="bg-foreground/10 h-1.5 overflow-hidden rounded-full">
                                    <div className="bg-brand h-full rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </AppLayout >
    );
}