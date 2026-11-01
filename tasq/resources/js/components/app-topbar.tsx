import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/tasq/button';
import { AddMemberModal } from '@/components/teams/add-member-modal';
import { CreateTeamModal } from '@/components/teams/create-team-modal';
import { JoinTeamModal } from '@/components/teams/join-team-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ChevronDown, ListPlus, LogIn, Plus, Search, UserPlus, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './tasq/dropdown-menu';
import { UserMenuContent } from './tasq/user-menu-content';

export function AppTopbar({ title, onCreateTask }: { title: string; onCreateTask?: () => void }) {
    const { auth, currentTeam } = usePage<SharedData>().props;
    const getInitials = useInitials();

    const [createOpen, setCreateOpen] = useState(false);
    const [joinOpen, setJoinOpen] = useState(false);
    const [memberOpen, setMemberOpen] = useState(false);

    const isResponsable = currentTeam?.is_responsable ?? false;
    // Outside a team page: always. On a team page: only the responsable (a collaborateur gets no button).
    const showQuickCreate = !currentTeam || isResponsable;

    const newTask = () => {
        if (onCreateTask) onCreateTask();
        else if (currentTeam) router.visit(route('teams.tasks.index', currentTeam.id));
    };

    return (
        <header className="flex h-20 shrink-0 items-center gap-4 px-6 md:px-8">
            {/* Sidebar toggle on mobile only; on desktop use Ctrl+B */}
            <SidebarTrigger className="-ml-2 md:hidden" />

            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>

            {/* Search: not wired yet */}
            <div className="relative ml-6 hidden max-w-sm flex-1 lg:block xl:ml-20">
                <Search className="text-muted-foreground absolute top-1/2 left-0 size-6 -translate-y-1/2" />
                <input
                    type="search"
                    placeholder="Rechercher..."
                    className="placeholder:text-muted-foreground border-foreground/20 focus:border-brand h-10 w-full border-0 border-b bg-transparent pl-10 text-sm transition-colors focus:outline-hidden"
                />
            </div>

            <div className="ml-auto flex items-center gap-3">
                {showQuickCreate && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" aria-label="Créer">
                                <Plus />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {currentTeam && isResponsable && (
                                <>
                                    <DropdownMenuItem onSelect={newTask}>
                                        <ListPlus />
                                        Nouvelle tâche
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setMemberOpen(true)}>
                                        <UserPlus />
                                        Ajouter un collaborateur
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
                                <UsersRound />
                                Créer une team
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setJoinOpen(true)}>
                                <LogIn />
                                Rejoindre une team
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

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

            <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} />
            <JoinTeamModal open={joinOpen} onClose={() => setJoinOpen(false)} />
            {currentTeam && <AddMemberModal open={memberOpen} onClose={() => setMemberOpen(false)} teamId={currentTeam.id} />}
        </header>
    );
}