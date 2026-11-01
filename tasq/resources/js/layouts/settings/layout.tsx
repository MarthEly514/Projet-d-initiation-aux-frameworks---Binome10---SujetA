import { Button } from '@/components/tasq/button';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { KeyRound, Palette, User } from 'lucide-react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profil', url: '/settings/profile', icon: User },
    { title: 'Mot de passe', url: '/settings/password', icon: KeyRound },
    { title: 'Apparence', url: '/settings/appearance', icon: Palette },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    // usePage().url is reactive and SSR-safe, unlike window.location
    const path = usePage().url.split('?')[0];

    return (
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            <aside className="lg:w-56 lg:shrink-0">
                <p className="text-muted-foreground mb-4 hidden text-sm lg:block">Gérez votre profil et les paramètres de votre compte.</p>

                {/* Horizontal row on mobile, vertical list on desktop */}
                <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Paramètres">
                    {sidebarNavItems.map((item) => {
                        const active = path === item.url;
                        return (
                            <Button
                                key={item.url}
                                asChild
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    'shrink-0 justify-start rounded-full px-4',
                                    active ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground',
                                )}
                            >
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon />}
                                    {item.title}
                                </Link>
                            </Button>
                        );
                    })}
                </nav>
            </aside>

            <div className="min-w-0 flex-1 lg:max-w-2xl">
                <section className="space-y-12 rounded-[2rem] p-6 sm:p-8">{children}</section>
            </div>
        </div>
    );
}