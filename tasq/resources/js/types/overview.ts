export type StatusCount = { key: 'a_faire' | 'en_cours' | 'review' | 'faite'; label: string; count: number };

export type OverviewTask = { id: number; name: string; end_date: string | null };

export type MemberWorkload = {
    id: number;
    name: string;
    role: 'responsable' | 'collaborateur';
    open_count: number;
    done_count: number;
};