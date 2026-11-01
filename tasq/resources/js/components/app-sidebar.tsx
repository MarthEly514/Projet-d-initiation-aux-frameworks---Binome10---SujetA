import AppLogo from '@/components/app-logo';
import { NavMain, type SidebarNavItem } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { CalendarRange, ClipboardList, Gauge, LayoutGrid, ListChecks, LogOut, Settings, Users, UsersRound } from 'lucide-react';

const generalNav: SidebarNavItem[] = [
    { title: 'Overview', url: '/dashboard', icon: LayoutGrid },
    { title: 'Mes tâches', url: '/my-tasks', icon: ClipboardList },
    { title: 'Teams', url: '/teams', icon: Users, exact: true },
];

const teamNav = (id: string): SidebarNavItem[] => [
    { title: 'Overview', url: `/teams/${id}/overview`, icon: Gauge },
    { title: 'Tâches', url: `/teams/${id}/tasks`, icon: ListChecks },
    { title: 'Timeline', url: `/teams/${id}/timeline`, icon: CalendarRange },
    { title: 'Collabs', url: `/teams/${id}/members`, icon: UsersRound },
];

const footerNav: SidebarNavItem[] = [{ title: 'Paramètres', url: '/settings/profile', icon: Settings }];

export function AppSidebar() {
    const { url } = usePage();
    // Team section appears only inside /teams/{id}/...
    const teamId = url.match(/^\/teams\/(\d+)/)?.[1];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="px-4 pt-0 pb-6">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className='hover:bg-transparent'>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-1">
                <NavMain items={generalNav} />
                {teamId && <NavMain label="Team en cours" items={teamNav(teamId)} />}
            </SidebarContent>

            <SidebarFooter className="gap-1 pb-0">
                <NavMain items={footerNav} />
                <SidebarMenu className="px-3">
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            tooltip={{ children: 'Déconnexion' }}
                            className="text-muted-foreground h-10 gap-5 px-6 rounded-2xl text-[15px] hover:text-red-400/80 hover:bg-red-400/10 [&>svg]:size-5"
                        >
                            <Link method="post" href={route('logout')} as="button">
                                <LogOut />
                                <span>Déconnexion</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}