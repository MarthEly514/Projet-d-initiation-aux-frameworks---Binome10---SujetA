import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/tasq/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { DropdownMenuContent } from './tasq/dropdown-menu';
import { UserMenuContent } from './tasq/user-menu-content';

export function AppTopbar({ title }: { title: string }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();

    return (
        <header className="flex h-20 shrink-0 items-center gap-4 px-6 md:px-8">
            {/* Sidebar toggle on mobile only; on desktop use Ctrl+B */}
            <SidebarTrigger className="-ml-2 md:hidden" />

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>

            {/* Search: not wired yet */}
            <div className="relative ml-6 xl:ml-20 hidden max-w-sm flex-1 lg:block">
                <Search className="text-muted-foreground absolute top-1/2 left-0 size-6 -translate-y-1/2" />
                <input
                    type="search"
                    placeholder="Rechercher..."
                    className="placeholder:text-muted-foreground border-foreground/20 focus:border-brand h-10 w-full border-0 border-b bg-transparent pl-10 text-sm transition-colors focus:outline-hidden"
                />
            </div>

            <div className="ml-auto flex items-center gap-3">
                {/* TODO: open the task creation modal (task feature) */}
                <Button size='icon' aria-label="Nouvelle tâche">
                    <Plus />
                </Button>

                <NotificationBell />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="hover:bg-foreground/5 focus-visible:ring-brand/50 flex items-center gap-2 rounded-full p-1 pr-3 outline-hidden focus-visible:ring-2">
                            <Avatar className="size-12">
                                <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                <AvatarFallback className="bg-brand/15 text-brand text-sm">{getInitials(auth.user.name)}</AvatarFallback>
                            </Avatar>
                            <span className="hidden text-sm sm:block">{auth.user.name}</span>
                            <ChevronDown className="text-muted-foreground size-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}