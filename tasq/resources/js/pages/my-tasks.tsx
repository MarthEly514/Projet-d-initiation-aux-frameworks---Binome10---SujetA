import { Head, router } from '@inertiajs/react';

import { LabelSelect } from '@/components/tasq/label-select';
import TaskCard from '@/components/tasks/task-card';
import AppLayout from '@/layouts/app-layout';
import { type MyTaskFilters, type Task, type TaskStatusOption } from '@/types/task';

const ALL = 'all';

interface MyTasksProps {
    tasks: Task[];
    teams: { id: number; name: string }[];
    statuses: TaskStatusOption[];
    filters: MyTaskFilters;
}

export default function MyTasks({ tasks, teams, statuses, filters }: MyTasksProps) {
    const applyFilters = (changes: Partial<MyTaskFilters>) => {
        const query = { ...filters, ...changes };

        router.get(
            route('my-tasks'),
            { ...(query.status && { status: query.status }), ...(query.team && { team: query.team }) },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const hasFilters = filters.status !== null || filters.team !== null;

    return (
        <AppLayout title="Mes tâches">
            <Head title="Mes tâches" />

            <div className="flex flex-1 flex-col gap-8">
                <div className="flex flex-wrap gap-6">
                    <LabelSelect
                        id="filter-status"
                        label="Statut"
                        value={filters.status ?? ALL}
                        options={[{ value: ALL, label: 'Tous' }, ...statuses]}
                        onValueChange={(value) => applyFilters({ status: value === ALL ? null : (value as MyTaskFilters['status']) })}
                        containerClassName="w-full sm:w-64"
                    />

                    <LabelSelect
                        id="filter-team"
                        label="Équipe"
                        value={filters.team ? String(filters.team) : ALL}
                        options={[{ value: ALL, label: 'Toutes' }, ...teams.map((team) => ({ value: String(team.id), label: team.name }))]}
                        onValueChange={(value) => applyFilters({ team: value === ALL ? null : Number(value) })}
                        containerClassName="w-full sm:w-64"
                    />
                </div>

                {tasks.length === 0 ? (
                    <p className="text-muted-foreground py-12 text-center text-sm">{hasFilters ? 'Aucune tâche pour ces filtres.' : 'Aucune tâche ne vous est assignée.'}</p>
                ) : (
                    <ul className="flex flex-col gap-6">
                        {tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </ul>
                )}
            </div>
        </AppLayout>
    );
}
