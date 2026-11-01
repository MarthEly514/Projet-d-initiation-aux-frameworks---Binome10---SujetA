import { Head, router, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck, ShieldOff, UserMinus, UserPlus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { Modal } from '@/components/tasq/modal';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type TeamMember } from '@/types/team';

type Props = {
    team: { id: number; name: string };
    members: TeamMember[];
    can_manage: boolean;
};

export default function TeamMembers({ team, members, can_manage }: Props) {
    const { errors } = usePage().props;
    const [toRemove, setToRemove] = useState<TeamMember | null>(null);
    const [busy, setBusy] = useState(false);

    const invite = useForm({ email: '' });

    const submitInvite: FormEventHandler = (e) => {
        e.preventDefault();
        invite.post(route('teams.members.store', team.id), {
            preserveScroll: true,
            onSuccess: () => invite.reset(),
        });
    };

    const changeRole = (member: TeamMember, role: 'responsable' | 'collaborateur') =>
        router.put(route('teams.members.role', [team.id, member.id]), { role }, { preserveScroll: true });

    const remove = () => {
        if (!toRemove) return;
        router.delete(route('teams.members.destroy', [team.id, toRemove.id]), {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => {
                setBusy(false);
                setToRemove(null);
            },
        });
    };

    return (
        <AppLayout title="Collaborateurs">
            <Head title={`Collaborateurs · ${team.name}`} />

            {can_manage && (
                <form onSubmit={submitInvite} className="bg-foreground/5 flex flex-col gap-4 rounded-[2rem] p-6">
                    <h2 className="font-medium">Ajouter un membre</h2>
                    <p className="text-muted-foreground text-sm">
                        Saisissez l'e-mail d'une personne déjà inscrite sur Tasq. Elle rejoindra la team comme collaborateur.
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <LabelInput
                            label="E-mail"
                            type="email"
                            required
                            containerClassName="flex-1"
                            value={invite.data.email}
                            onChange={(e) => invite.setData('email', e.target.value)}
                            error={invite.errors.email}
                        />
                        <Button type="submit" disabled={invite.processing}>
                            {invite.processing ? <LoaderCircle className="animate-spin" /> : <UserPlus />}
                            Ajouter
                        </Button>
                    </div>
                </form>
            )}

            <section className="bg-foreground/5 flex flex-col gap-2 rounded-[2rem] p-6">
                <h2 className="font-medium">
                    Membres <span className="text-muted-foreground">({members.length})</span>
                </h2>

                <InputError message={errors.member} />

                <ul className="divide-foreground/10 divide-y">
                    {members.map((m) => {
                        const isResp = m.role === 'responsable';
                        return (
                            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                                <div className="min-w-0">
                                    <p className="truncate">
                                        {m.name}
                                        {m.is_me && <span className="text-muted-foreground"> (vous)</span>}
                                    </p>
                                    <p className="text-muted-foreground truncate text-sm">{m.email}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-1 text-xs',
                                            isResp ? 'bg-brand/15 text-brand' : 'bg-foreground/10 text-muted-foreground',
                                        )}
                                    >
                                        {isResp ? 'Responsable' : 'Collaborateur'}
                                    </span>

                                    {can_manage && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => changeRole(m, isResp ? 'collaborateur' : 'responsable')}
                                            >
                                                {isResp ? <ShieldOff /> : <ShieldCheck />}
                                                {isResp ? 'Rétrograder' : 'Promouvoir'}
                                            </Button>
                                            {!m.is_me && (
                                                <Button variant="ghost" size="sm" className='hover:text-red-400/80 hover:bg-red-400/10' onClick={() => setToRemove(m)}>
                                                    <UserMinus />
                                                    Retirer
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <Modal
                open={toRemove !== null}
                onClose={() => setToRemove(null)}
                title="Retirer ce membre ?"
                description={
                    toRemove
                        ? `${toRemove.name} n'aura plus accès à « ${team.name} » et sera retiré(e) de toutes ses tâches.`
                        : undefined
                }
            >
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setToRemove(null)}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={remove} disabled={busy}>
                        {busy && <LoaderCircle className="animate-spin" />}
                        Retirer
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}