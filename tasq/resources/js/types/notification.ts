export interface AppNotification {
    id: string;
    task_name: string;
    team_name: string;
    is_read: boolean;
    date: string;
}

export interface NotificationSummary {
    unread: number;
    items: AppNotification[];
}
