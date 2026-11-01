export type TeamRole = 'responsable' | 'collaborateur';

export type TeamSummary = {
    id: number;
    name: string;
    role: TeamRole;
    members_count: number;
    tasks_count: number;
    done_tasks_count: number;
};

export type TeamDetail = {
    id: number;
    name: string;
    invite_code: string | null;
    members_count: number;
    tasks_count: number;
    done_tasks_count: number;
};

export type TeamMember = {
    id: number;
    name: string;
    email: string;
    role: TeamRole;
    is_me: boolean;
};