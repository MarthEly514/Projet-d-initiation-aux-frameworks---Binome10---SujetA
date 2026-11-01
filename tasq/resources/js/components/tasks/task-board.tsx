import { TaskBoardCard } from '@/components/tasks/task-board-card';
import { type Task, type TaskStatusOption } from '@/types/task';

const COLORS: Record<string, string> = {
    a_faire: '#9f5bfe',
    en_cours: '#1a8fe8',
    review: '#f14f1e',
    faite: '#0ace82',
};

type Props = {
    tasks: Task[];
    statuses: TaskStatusOption[];
    canManage: boolean;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
};

export function TaskBoard({ tasks, statuses, canManage, onEdit, onDelete }: Props) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statuses.map((status) => {
                const column = tasks.filter((t) => t.status === status.value);
                const color = COLORS[status.value] ?? '#64748b';

                return (
                    <section key={status.value} className="flex min-w-0 flex-col gap-4">
                        <h2 className="flex items-center gap-2 text-sm font-medium">
                            <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
                            {status.label}
                            <span className="text-muted-foreground">{column.length}</span>
                        </h2>

                        {column.length === 0 ? (
                            <p className="border-foreground/10 text-muted-foreground h-full flex items-center justify-center rounded-[1.5rem] border border-dashed p-5 text-center text-xs">
                                Aucune tâche
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-4">
                                {column.map((task) => (
                                    <TaskBoardCard
                                        key={task.id}
                                        task={task}
                                        color={color}
                                        isDone={status.value === 'faite'}
                                        canManage={canManage}
                                        onEdit={() => onEdit(task)}
                                        onDelete={() => onDelete(task)}
                                    />
                                ))}
                            </ul>
                        )}
                    </section>
                );
            })}
        </div>
    );
}