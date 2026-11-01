import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/tasq/button';
import { CreateTeamModal } from '@/components/teams/create-team-modal';
import { JoinTeamModal } from '@/components/teams/join-team-modal';
import { TeamCard } from '@/components/teams/team-card';
import AppLayout from '@/layouts/app-layout';
import { type TeamSummary } from '@/types/team';

export default function TeamsIndex({ teams }: { teams: TeamSummary[] }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);

    return (
        <AppLayout title="Mes teams">
            <Head title="Mes teams" />

            <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus />
                    Créer une team
                </Button>
                <Button variant="outline" onClick={() => setJoinOpen(true)}>
                    Rejoindre avec un code
                </Button>
            </div>

            {teams.length === 0 ? (
                <div className="bg-foreground/5 flex flex-col items-center gap-2 rounded-[2rem] px-6 py-16 text-center">
                    <p className="text-lg font-medium">Vous n'avez pas encore de team</p>
                    <p className="text-muted-foreground max-w-sm text-sm">
                        Créez-en une pour organiser votre travail, ou rejoignez celle d'un collègue avec son code d'invitation.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {teams.map((team) => (
                        <TeamCard key={team.id} team={team} />
                    ))}
                </div>
            )}

            <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <JoinTeamModal open={joinOpen} onClose={() => setJoinOpen(false)} />
        </AppLayout>
    );
}