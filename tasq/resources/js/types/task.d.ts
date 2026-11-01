export type TaskStatus = 'a_faire' | 'en_cours' | 'review' | 'faite';

export interface TaskMember {
    id: number;
    name: string;
}

export interface TaskStatusOption {
    value: TaskStatus;
    label: string;
}

export interface TaskStep {
    id: number;
    title: string;
    is_done: boolean;
}

export interface Task {
    id: number;
    name: string;
    description: string | null;
    status: TaskStatus;
    status_label: string;
    rejection_comment: string | null;
    start_date: string | null;
    end_date: string | null;
    lead: TaskMember | null;
    collaborators: TaskMember[];
    team?: { id: number; name: string };
    steps?: TaskStep[];
    steps_count?: number | null;
    done_steps_count?: number | null;
}

export interface TaskFilters {
    status: TaskStatus | null;
    responsible: number | null;
}

export interface MyTaskFilters {
    status: TaskStatus | null;
    team: number | null;
}

export interface TaskPermissions {
    manageSteps: boolean;
    work: boolean;
    submit: boolean;
    review: boolean;
}
