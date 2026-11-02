import { router } from '@inertiajs/react';
import { LoaderCircle, Search } from 'lucide-react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Result = {
    teams: { id: number; name: string }[];
    tasks: { id: number; name: string; team: string; status: string }[];
};

type Item = { key: string; label: string; hint: string; href: string };

const toItems = (data: Result): Item[] => [
    ...data.teams.map((t) => ({ key: `team-${t.id}`, label: t.name, hint: 'Team', href: route('teams.show', t.id) })),
    ...data.tasks.map((t) => ({ key: `task-${t.id}`, label: t.name, hint: `${t.team} · ${t.status}`, href: route('tasks.show', t.id) })),
];

export function SearchBar({ className }: { className?: string }) {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(0);
    const box = useRef<HTMLDivElement>(null);

    const term = query.trim();

    // Debounced search, the previous request is cancelled when typing continues
    useEffect(() => {
        if (term.length < 2) {
            setItems([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        setLoading(true);

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(route('search', { q: term }), {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) throw new Error('search failed');
                setItems(toItems(await res.json()));
                setActive(0);
            } catch (e) {
                if ((e as Error).name !== 'AbortError') setItems([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [term]);

    // Close when clicking outside
    useEffect(() => {
        const onDown = (e: MouseEvent) => {
            if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    const go = (item: Item) => {
        setOpen(false);
        setQuery('');
        router.visit(item.href);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && items[active]) {
            e.preventDefault();
            go(items[active]);
        }
    };

    const showPanel = open && term.length >= 2;

    return (
        <div ref={box} className={cn('relative', className)}>
            <Search className="text-muted-foreground absolute top-1/2 left-0 size-6 -translate-y-1/2" />
            <input
                type="search"
                role="combobox"
                aria-expanded={showPanel}
                aria-label="Rechercher"
                autoComplete="off"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                className="placeholder:text-muted-foreground border-foreground/20 focus:border-brand h-10 w-full border-0 border-b bg-transparent pr-8 pl-10 text-sm transition-colors focus:outline-hidden"
            />
            {loading && <LoaderCircle className="text-muted-foreground absolute top-1/2 right-0 size-4 -translate-y-1/2 animate-spin" />}

            {showPanel && (
                <div className="bg-popover border-foreground/10 absolute top-full right-0 left-0 z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border p-2 shadow-xl">
                    {items.length === 0 && !loading ? (
                        <p className="text-muted-foreground px-3 py-4 text-center text-sm">Aucun résultat</p>
                    ) : (
                        <ul>
                            {items.map((item, i) => (
                                <li key={item.key}>
                                    <button
                                        type="button"
                                        onMouseEnter={() => setActive(i)}
                                        onClick={() => go(item)}
                                        className={cn(
                                            'flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left',
                                            i === active && 'bg-foreground/10',
                                        )}
                                    >
                                        <span className="w-full truncate text-sm">{item.label}</span>
                                        <span className="text-muted-foreground text-xs">{item.hint}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}