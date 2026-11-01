export type StatusKey = 'a_faire' | 'en_cours' | 'review' | 'faite';

export type UpcomingTask = {
    id: number;
    name: string;
    status: StatusKey;
    end_date: string | null;
    is_overdue: boolean;
    team_name: string;
};