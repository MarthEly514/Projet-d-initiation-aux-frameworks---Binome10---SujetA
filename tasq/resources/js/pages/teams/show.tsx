import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarRange, Check, Copy, Gauge, ListChecks, LoaderCircle, LogOut, Trash2, UsersRound } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/tasq/button';
import { LabelInput } from '@/components/tasq/label-input';
import { Modal } from '@/components/tasq/modal';import AppLayout from '@/layouts/app-layout';
import { type TeamDetail, type TeamRole } from '@/types/team';

type Props = {
    team: TeamDetail;
    my_role: TeamRole;
    can: { update: boolean; delete: boolean };
};

export default function TeamShow({ team, my_role, can }: Props) {
    const { errors } = usePage().props;
    const [leaveOpen, setLeaveOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);

    const rename = useForm({ name: team.name });

    const submitRename: FormEventHandler = (e) => {
        e.preventDefault();
        rename.put(route('teams.update', team.id), { preserveScroll: true });
    };

    const visitOptions = { onStart: () => setBusy(true), onFinish: () => setBusy(false) };
    const leave = () => router.post(route('teams.leave', team.id), {}, visitOptions);
    const destroy = () => router.delete(route('teams.destroy', team.id), visitOptions);

    const copyCode = async () => {
        if (!team.invite_code) return;
        await navigator.clipboard.writeText(team.invite_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const stats = [
        { label: 'Membres', value: team.members_count },
        { label: 'Tâches', value: team.tasks_count },
        { label: 'Terminées', value: team.done_tasks_count },
    ];

    const links = [
        { label: 'Tâches', href: route('teams.tasks.index', team.id), icon: ListChecks },
        { label: 'Overview', href: route('teams.overview', team.id), icon: Gauge },
        { label: 'Timeline', href: route('teams.timeline', team.id), icon: CalendarRange },
        { label: 'Collabs', href: route('teams.members.index', team.id), icon: UsersRound },
    ];

    return (
        <AppLayout title={team.name}>
            <Head title={team.name} />

            <p className="text-muted-foreground -mt-2 text-sm">
                Vous êtes {my_role === 'responsable' ? 'responsable' : 'collaborateur'} de cette team.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((s) => (
                    <div key={s.label} className="bg-foreground/5 rounded-[2rem] p-6">
                        <p className="text-muted-foreground text-sm">{s.label}</p>
                        <p className="mt-2 text-3xl font-semibold">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {links.map((l) => (
                    <Link
                        key={l.label}
                        href={l.href}
                        className="bg-foreground/5 hover:bg-foreground/10 flex items-center gap-3 rounded-[2rem] p-5 transition-colors"
                    >
                        <l.icon className="text-brand size-5" />
                        <span>{l.label}</span>
                    </Link>
                ))}
            </div>

            {can.update && (
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="bg-foreground/5 flex flex-col gap-4 rounded-[2rem] p-6">
                        <h2 className="font-medium">Code d'invitation</h2>
                        <p className="text-muted-foreground text-sm">Partagez ce code pour que quelqu'un rejoigne la team.</p>
                        <div className="flex items-center justify-between gap-3">
                            <span className="font-mono text-2xl tracking-widest">{team.invite_code}</span>
                            <Button variant="outline" size="sm" onClick={copyCode}>
                                {copied ? <Check /> : <Copy />}
                                {copied ? 'Copié' : 'Copier'}
                            </Button>
                        </div>
                    </div>

                    <form onSubmit={submitRename} className="bg-foreground/5 flex flex-col gap-4 rounded-[2rem] p-6">
                        <h2 className="font-medium">Renommer la team</h2>
                        <LabelInput
                            label="Nom de la team"
                            required
                            value={rename.data.name}
                            onChange={(e) => rename.setData('name', e.target.value)}
                            error={rename.errors.name}
                        />
                        <Button type="submit" size="sm" className="self-start" disabled={rename.processing || rename.data.name === team.name}>
                            Enregistrer
                        </Button>
                    </form>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => setLeaveOpen(true)}>
                    <LogOut />
                    Quitter la team
                </Button>
                {can.delete && (
                    <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 />
                        Supprimer la team
                    </Button>
                )}
            </div>

            <Modal
                open={leaveOpen}
                onClose={() => setLeaveOpen(false)}
                title="Quitter la team ?"
                description={`Vous n'aurez plus accès à « ${team.name} » ni à ses tâches.`}
            >
                <InputError message={errors.team} />
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setLeaveOpen(false)}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={leave} disabled={busy}>
                        {busy && <LoaderCircle className="animate-spin" />}
                        Quitter
                    </Button>
                </div>
            </Modal>

            <Modal
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                title="Supprimer la team ?"
                description={`« ${team.name} » sera supprimée avec toutes ses tâches, étapes et son historique. Cette action est définitive.`}
            >
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
                        Annuler
                    </Button>
                    <Button variant="destructive" onClick={destroy} disabled={busy}>
                        {busy && <LoaderCircle className="animate-spin" />}
                        Supprimer définitivement
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}