import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';
import { type BreadcrumbItem } from '@/types';

interface Props {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
    onCreateTask?: () => void;
}

export default function AppSidebarLayout({ children, breadcrumbs = [], title, onCreateTask }: Props) {
    const heading = title ?? breadcrumbs[breadcrumbs.length - 1]?.title ?? '';

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden max-h-screen lg:p-10 lg:pb-0">
                <AppTopbar title={heading} onCreateTask={onCreateTask} />
                <div className="flex flex-1 flex-col gap-6 lg:gap-15 px-6 pb-8 pt-8 md:px-8 overflow-scroll">{children}</div>
            </AppContent>
        </AppShell>
    );
}