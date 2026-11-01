import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './tasq/dropdown-menu';
import { Button } from './tasq/button';

export function NotificationBell() {
    const { notifications } = usePage<SharedData>().props;
    const unreadCount = notifications?.unread ?? 0;
    const items = notifications?.items ?? [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} non ${unreadCount > 1 ? 'lues' : 'lue'}` : 'Notifications'}>
                    <Bell className="size-6" />
                    {unreadCount > 0 && <span className="bg-brand absolute top-2 right-2.5 size-2 rounded-full" />}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" collisionPadding={16} className="max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto">
                <div className="px-4 py-3 text-sm font-medium">Notifications</div>

                {items.length === 0 && <p className="text-muted-foreground px-4 pb-3 text-sm">Aucune notification.</p>}

                {items.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="items-start" onSelect={() => router.post(route('notifications.read', notification.id))}>
                        <span className={notification.is_read ? 'mt-1.5 size-2 shrink-0' : 'bg-brand mt-1.5 size-2 shrink-0 rounded-full'} />
                        <span className="min-w-0 space-y-1">
                            <span className="block font-medium [overflow-wrap:anywhere]">{notification.task_name}</span>
                            <span className="text-muted-foreground block text-xs">
                                À valider · {notification.team_name} · {notification.date}
                            </span>
                        </span>
                    </DropdownMenuItem>
                ))}

                {unreadCount > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-brand" onSelect={() => router.post(route('notifications.read-all'), {}, { preserveScroll: true })}>
                            Tout marquer comme lu
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
