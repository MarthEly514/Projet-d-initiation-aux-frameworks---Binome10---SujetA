import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import { LabelSelect } from '@/components/tasq/label-select';
import DeleteTaskDialog from '@/components/tasks/delete-task-dialog';
import TaskCard from '@/components/tasks/task-card';
import TaskFormDialog from '@/components/tasks/task-form-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Task, type TaskFilters, type TaskMember, type TaskStatusOption } from '@/types/task';

const ALL = 'all';

interface TasksIndexProps {
    team: { id: number; name: string };
    tasks: Task[];
    members: TaskMember[];
    statuses: TaskStatusOption[];
    filters: TaskFilters;
    canManage: boolean;
}

export default function TasksIndex({ team, tasks, members, statuses, filters, canManage }: TasksIndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);

    const applyFilters = (changes: Partial<TaskFilters>) => {
        const query = { ...filters, ...changes };

        router.get(
            route('tasks.index', team.id),
            { ...(query.status && { status: query.status }), ...(query.responsible && { responsible: query.responsible }) },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const hasFilters = filters.status !== null || filters.responsible !== null;

    return (
        <AppLayout title="Tâches" onCreateTask={canManage ? () => setIsCreating(true) : undefined}>
            <Head title={`Tâches · ${team.name}`} />

            <div className="flex flex-1 flex-col gap-8">
                <div className="flex flex-wrap gap-6">
                    <LabelSelect
                        id="filter-status"
                        label="Statut"
                        value={filters.status ?? ALL}
                        options={[{ value: ALL, label: 'Tous' }, ...statuses]}
                        onValueChange={(value) => applyFilters({ status: value === ALL ? null : (value as TaskFilters['status']) })}
                        containerClassName="w-full sm:w-64"
                    />

                    <LabelSelect
                        id="filter-responsible"
                        label="Responsable"
                        value={filters.responsible ? String(filters.responsible) : ALL}
                        options={[{ value: ALL, label: 'Tous' }, ...members.map((member) => ({ value: String(member.id), label: member.name }))]}
                        onValueChange={(value) => applyFilters({ responsible: value === ALL ? null : Number(value) })}
                        containerClassName="w-full sm:w-64"
                    />
                </div>

                {tasks.length === 0 ? (
                    <p className="text-muted-foreground py-12 text-center text-sm">{hasFilters ? 'Aucune tâche pour ces filtres.' : 'Aucune tâche pour le moment.'}</p>
                ) : (
                    <ul className="flex flex-col gap-6">
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} canManage={canManage} onEdit={() => setEditingTask(task)} onDelete={() => setDeletingTask(task)} />
                        ))}
                    </ul>
                )}
            </div>

            <TaskFormDialog
                key={editingTask?.id ?? 'new'}
                open={isCreating || editingTask !== null}
                teamId={team.id}
                task={editingTask}
                members={members}
                statuses={statuses}
                onClose={() => {
                    setIsCreating(false);
                    setEditingTask(null);
                }}
            />

            <DeleteTaskDialog task={deletingTask} onClose={() => setDeletingTask(null)} />
        </AppLayout>
    );
}
