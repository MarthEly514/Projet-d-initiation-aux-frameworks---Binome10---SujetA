import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/tasq/button';
import { CreateTeamModal } from '@/components/teams/create-team-modal';
import { JoinTeamModal } from '@/components/teams/join-team-modal';
import { TeamCard } from '@/components/teams/team-card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type StatusKey, type UpcomingTask } from '@/types/dashboard';
import { type TeamSummary } from '@/types/team';

type Props = {
    teams: TeamSummary[];
    counts: Record<StatusKey, number>;
    overdue: number;
    upcoming: UpcomingTask[];
};

const STATUS_LABELS: Record<StatusKey, string> = {
    a_faire: 'À faire',
    en_cours: 'En cours',
    review: 'En revue',
    faite: 'Terminées',
};

export default function Dashboard({ teams, counts, overdue, upcoming }: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    const tiles = [
        ...(Object.keys(STATUS_LABELS) as StatusKey[]).map((key) => ({
            label: STATUS_LABELS[key],
            value: counts[key],
            danger: false,
        })),
        { label: 'En retard', value: overdue, danger: true },
    ];

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <section className="flex flex-col gap-4">
                <h2 className="text-lg font-medium">Mes tâches</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    {tiles.map((t) => (
                        <div key={t.label} className="bg-foreground/5 rounded-[2rem] p-6">
                            <p className="text-muted-foreground text-sm">{t.label}</p>
                            <p className={cn('mt-2 text-3xl font-semibold', t.danger && t.value > 0 && 'text-destructive')}>{t.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="text-lg font-medium">Tâches à venir</h2>
                {upcoming.length === 0 ? (
                    <div className="bg-foreground/5 text-muted-foreground rounded-[2rem] px-6 py-10 text-center text-sm">
                        Aucune tâche en cours qui vous soit assignée.
                    </div>
                ) : (
                    <div className="bg-foreground/5 divide-foreground/10 divide-y rounded-[2rem] px-6">
                        {upcoming.map((task) => (
                            <Link key={task.id} href={route('tasks.show', task.id)} className="flex items-center justify-between gap-4 py-4">
                                <div className="min-w-0">
                                    <p className="truncate">{task.name}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {task.team_name} · {STATUS_LABELS[task.status]}
                                    </p>
                                </div>
                                <span className={cn('shrink-0 text-sm', task.is_overdue ? 'text-destructive' : 'text-muted-foreground')}>
                                    {task.end_date ? new Date(task.end_date).toLocaleDateString('fr-FR') : 'Sans échéance'}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-medium">Mes teams</h2>
                    <div className="flex gap-3">
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus />
                            Créer une team
                        </Button>
                        <Button variant="outline" onClick={() => setJoinOpen(true)}>
                            Rejoindre avec un code
                        </Button>
                    </div>
                </div>

                {teams.length === 0 ? (
                    <div className="bg-foreground/5 flex flex-col items-center gap-2 rounded-[2rem] px-6 py-12 text-center">
                        <p className="text-lg font-medium">Vous n'avez pas encore de team</p>
                        <p className="text-muted-foreground max-w-sm text-sm">
                            Créez-en une (vous en serez le responsable) ou rejoignez celle d'un collègue avec son code d'invitation.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {teams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                )}
            </section>

            <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <JoinTeamModal open={joinOpen} onClose={() => setJoinOpen(false)} />
        </AppLayout>
    );
}