import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/tasq/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';

export function UserMenuContent({ user }: { user: User }) {
    const cleanup = useMobileNavigation();

    return (
        <>
            <DropdownMenuLabel>
                <div className="flex items-center gap-3 text-left text-sm">
                    <UserInfo user={user} showEmail />
                </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="w-full text-left" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings />
                        Paramètres
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="text-red-400/80 focus:bg-red-400/10 [&_svg]:text-destructive">
                <Link className="w-full text-left" method="post" href={route('logout')} as="button" onClick={cleanup}>
                    <LogOut />
                    Déconnexion
                </Link>
            </DropdownMenuItem>
        </>
    );
}