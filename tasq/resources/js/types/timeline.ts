export type GanttTask = {
    id: number;
    name: string;
    status: 'a_faire' | 'en_cours' | 'review' | 'faite';
    start_date: string;
    end_date: string;
    assignees: string[];
    progress: number;
};

export type ActivityItem = { id: number; message: string; at: string };