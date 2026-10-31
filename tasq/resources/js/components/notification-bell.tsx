import { Bell } from 'lucide-react';
import { Button } from './tasq/button';

export function NotificationBell({ unreadCount = 0 }: { unreadCount?: number }) {
    return (
        <Button 
        variant='ghost'
        size='icon'
        >
            <Bell className="size-6" />
            {unreadCount > 0 && <span className="bg-brand absolute top-2 right-2.5 size-2 rounded-full" />}
        </Button>
    );
}