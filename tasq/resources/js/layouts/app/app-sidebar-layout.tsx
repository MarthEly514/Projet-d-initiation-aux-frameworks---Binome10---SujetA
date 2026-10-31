import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppTopbar } from '@/components/app-topbar';
import { type BreadcrumbItem } from '@/types';

interface Props {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
}

export default function AppSidebarLayout({ children, breadcrumbs = [], title }: Props) {
    const heading = title ?? breadcrumbs[breadcrumbs.length - 1]?.title ?? '';

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden lg:p-10">
                <AppTopbar title={heading} />
                <div className="flex flex-1 flex-col gap-6 px-6 pb-8 md:px-8">{children}</div>
            </AppContent>
        </AppShell>
    );
}