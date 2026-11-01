import { Head, router, useForm } from '@inertiajs/react';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/tasq/button';
import { StatusBadge } from '@/components/tasq/status-badge';
import RejectTaskDialog from '@/components/tasks/reject-task-dialog';
import StepList from '@/components/tasks/step-list';
import { formatDate } from '@/components/tasks/task-card';
import TextLink from '@/components/text-link';
import AppLayout from '@/layouts/app-layout';
import { type Task, type TaskPermissions } from '@/types/task';

interface TasksShowProps {
    team: { id: number; name: string };
    task: Task;
    can: TaskPermissions;
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="text-[16px] [overflow-wrap:anywhere]">{value}</dd>
        </div>
    );
}

export default function TasksShow({ team, task, can }: TasksShowProps) {
    const [isRejecting, setIsRejecting] = useState(false);
    const { post, processing } = useForm({});

    const steps = task.steps ?? [];
    const isRejected = task.rejection_comment !== null;

    const goBack = () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        router.visit(route('teams.tasks.index', team.id));
    }
};

    return (
        <AppLayout title="Tâche">
            <Head title={`${task.name} · ${team.name}`} />

            <div className="flex flex-1 flex-col gap-8">
                    <Button variant='ghost' className='w-fit' onClick={goBack}>
                        <ChevronLeft />
                        Retour
                    </Button>

                <section className="bg-foreground/5 flex flex-col gap-6 rounded-[2rem] p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <h2 className="min-w-0 flex-1 basis-64 text-[32px] leading-snug [overflow-wrap:anywhere]">{task.name}</h2>
                        <StatusBadge status={task.status} label={task.status_label} />
                    </div>

                    {task.description && <p className="text-muted-foreground text-[16px] whitespace-pre-line">{task.description}</p>}

                    <dl className="grid gap-6 sm:grid-cols-2">
                        <Detail label="Responsable" value={task.lead?.name ?? 'Sans responsable'} />
                        <Detail label="Collaborateurs" value={task.collaborators.map((collaborator) => collaborator.name).join(', ') || 'Aucun'} />
                        <Detail label="Début" value={task.start_date ? formatDate(task.start_date) : 'Non défini'} />
                        <Detail label="Échéance" value={task.end_date ? formatDate(task.end_date) : 'Non définie'} />
                    </dl>
                </section>

                {isRejected && (
                    <section className="bg-brand/10 flex flex-col gap-2 rounded-[2rem] p-8">
                        <h2 className="text-brand text-sm font-medium">À reprendre</h2>
                        <p className="text-[16px] whitespace-pre-line [overflow-wrap:anywhere]">{task.rejection_comment}</p>
                    </section>
                )}

                {(steps.length > 0 || can.manageSteps) && <StepList taskId={task.id} steps={steps} canManage={can.manageSteps} canCheck={can.work} />}

                {can.submit && (
                    <Button className="w-full sm:w-fit" disabled={processing} onClick={() => post(route('tasks.submit', task.id), { preserveScroll: true })}>
                        {processing && <LoaderCircle className="animate-spin" />}
                        {steps.length === 0 ? 'Marquer comme terminée' : 'Renvoyer en validation'}
                    </Button>
                )}

                {isRejected && can.work && !can.submit && <p className="text-muted-foreground text-sm">Cochez toutes les étapes pour renvoyer la tâche en validation.</p>}

                {can.review && (
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button className="w-full sm:w-fit" disabled={processing} onClick={() => post(route('tasks.approve', task.id), { preserveScroll: true })}>
                            {processing && <LoaderCircle className="animate-spin" />}
                            Valider
                        </Button>
                        <Button variant="outline" className="w-full sm:w-fit" onClick={() => setIsRejecting(true)}>
                            Renvoyer
                        </Button>
                    </div>
                )}
            </div>

            <RejectTaskDialog taskId={task.id} open={isRejecting} onClose={() => setIsRejecting(false)} />
        </AppLayout>
    );
}
