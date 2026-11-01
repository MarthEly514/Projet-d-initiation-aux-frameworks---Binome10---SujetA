import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

import { LabelSelect } from '@/components/tasq/label-select';
import DeleteTaskDialog from '@/components/tasks/delete-task-dialog';
import TaskCard from '@/components/tasks/task-card';
import TaskFormDialog from '@/components/tasks/task-form-dialog';
import AppLayout from '@/layouts/app-layout';
import { type Task, type TaskFilters, type TaskMember, type TaskStatusOption } from '@/types/task';
import { TaskBoard } from '@/components/tasks/task-board';

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

        const filterByResponsible = (responsible: number | null) => {
        router.get(
            route('teams.tasks.index', team.id),
            responsible ? { responsible } : {},
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };


    // const hasFilters = filters.status !== null || filters.responsible !== null;


    return (
        <AppLayout title="Tâches" onCreateTask={canManage ? () => setIsCreating(true) : undefined}>
            <Head title={`Tâches · ${team.name}`} />

            <div className="flex flex-1 flex-col gap-8">
                <LabelSelect
                    id="filter-responsible"
                    label="Responsable"
                    value={filters.responsible ? String(filters.responsible) : ALL}
                    options={[{ value: ALL, label: 'Tous' }, ...members.map((member) => ({ value: String(member.id), label: member.name }))]}
                    onValueChange={(value) => filterByResponsible(value === ALL ? null : Number(value))}
                    containerClassName="w-full sm:w-64"
                />

                <TaskBoard tasks={tasks} statuses={statuses} canManage={canManage} onEdit={setEditingTask} onDelete={setDeletingTask} />
            </div>

            <TaskFormDialog
                key={editingTask?.id ?? 'new'}
                open={isCreating || editingTask !== null}
                teamId={team.id}
                task={editingTask}
                members={members}
                onClose={() => {
                    setIsCreating(false);
                    setEditingTask(null);
                }}
            />

            <DeleteTaskDialog task={deletingTask} onClose={() => setDeletingTask(null)} />
        </AppLayout>
    );
}
