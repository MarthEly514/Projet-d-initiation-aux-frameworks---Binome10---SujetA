import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

// exact: active only on this exact URL (e.g. /teams, otherwise it stays active on /teams/1/...)
export type SidebarNavItem = NavItem & { exact?: boolean };

export function NavMain({ items = [], label }: { items: SidebarNavItem[]; label?: string }) {
    const path = usePage().url.split('?')[0];

    const isActive = (item: SidebarNavItem) =>
        item.exact ? path === item.url : path === item.url || path.startsWith(`${item.url}/`);

    return (
        <SidebarGroup className="px-3 py-1">
            {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={isActive(item)}
                            tooltip={{ children: item.title }}
                            className="text-muted-foreground gap-5 px-6 rounded-2xl text-[15px] hover:bg-foreground/5 data-[active=true]:bg-transparent data-[active=true]:text-foreground [&>svg]:size-6"
                        >
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}