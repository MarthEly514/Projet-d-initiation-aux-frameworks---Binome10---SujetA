import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

const COLORS = { todo: '#64748b', doing: '#1a8fe8', review: '#f59e0b', done: '#22c55e' } as const;
type Tone = keyof typeof COLORS;

const tint = (tone: Tone, pct = 22) => `color-mix(in oklab, ${COLORS[tone]} ${pct}%, transparent)`;

function Line({ className }: { className?: string }) {
    return <span className={cn('bg-foreground/15 block h-2 rounded-full', className)} />;
}

function Avatars({ count = 3, className }: { count?: number; className?: string }) {
    const palette = ['#1a8fe8', '#22c55e', '#f59e0b', '#a855f7'];
    return (
        <span className={cn('flex -space-x-2', className)}>
            {palette.slice(0, count).map((c) => (
                <span key={c} className="ring-background size-6 rounded-full ring-2" style={{ backgroundColor: c }} />
            ))}
        </span>
    );
}

function MiniCard({ tone, avatars = 2, tall = false }: { tone: Tone; avatars?: number; tall?: boolean }) {
    return (
        <div className="bg-foreground/5 relative flex flex-col gap-3 rounded-2xl p-4 pl-5">
            <span className="absolute top-4 bottom-4 left-2 w-1 rounded-full" style={{ backgroundColor: COLORS[tone] }} />
            <Line className="w-4/5" />
            {tall && <Line className="w-3/5" />}
            <div className="flex items-center justify-between">
                <Line className="w-8" />
                <Avatars count={avatars} />
            </div>
        </div>
    );
}

/* ---------- Board ---------- */

const columns: { tone: Tone; cards: { avatars: number; tall?: boolean }[] }[] = [
    { tone: 'todo', cards: [{ avatars: 2, tall: true }, { avatars: 1 }, { avatars: 3 }] },
    { tone: 'doing', cards: [{ avatars: 2 }, { avatars: 3, tall: true }] },
    { tone: 'review', cards: [{ avatars: 2, tall: true }, { avatars: 1 }] },
    { tone: 'done', cards: [{ avatars: 3 }, { avatars: 2, tall: true }, { avatars: 1 }] },
];

export function BoardIllustration({ className }: { className?: string }) {
    return (
        <div aria-hidden className={cn('bg-background border-foreground/10 rounded-[2rem] border p-5 shadow-2xl', className)}>
            <div className="mb-5 flex items-center gap-1.5">
                <span className="bg-foreground/15 size-2.5 rounded-full" />
                <span className="bg-foreground/15 size-2.5 rounded-full" />
                <span className="bg-foreground/15 size-2.5 rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
                {columns.map((col, i) => (
                    <div key={col.tone} className={cn('flex flex-col gap-3', i === 3 && 'hidden md:flex')}>
                        <div className="flex items-center gap-2 pb-1">
                            <span className="size-2 rounded-full" style={{ backgroundColor: COLORS[col.tone] }} />
                            <Line className="w-12" />
                        </div>
                        {col.cards.map((c, j) => (
                            <MiniCard key={j} tone={col.tone} avatars={c.avatars} tall={c.tall} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- Timeline ---------- */

const rows: { tone: Tone; left: number; width: number; progress: number }[][] = [
    [
        { tone: 'doing', left: 2, width: 44, progress: 65 },
        { tone: 'done', left: 52, width: 42, progress: 100 },
    ],
    [{ tone: 'review', left: 18, width: 52, progress: 85 }],
    [
        { tone: 'todo', left: 0, width: 34, progress: 20 },
        { tone: 'doing', left: 44, width: 50, progress: 40 },
    ],
];

export function TimelineIllustration({ className }: { className?: string }) {
    return (
        <div aria-hidden className={cn('bg-foreground/5 relative rounded-[2rem] p-6', className)}>
            <div className="text-muted-foreground mb-4 grid grid-cols-8 text-center text-xs">
                {['05', '06', '07', '08', '09', '10', '11', '12'].map((d) => (
                    <span key={d} className={d === '09' ? 'bg-brand mx-auto rounded-full px-2 py-0.5 text-white' : ''}>
                        {d}
                    </span>
                ))}
            </div>

            <div className="relative flex flex-col gap-4">
                <span className="bg-brand absolute top-0 bottom-0 left-[56%] z-10 w-px">
                    <span className="bg-brand absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full" />
                </span>

                {rows.map((row, i) => (
                    <div key={i} className="relative h-10">
                        {row.map((p, j) => (
                            <div
                                key={j}
                                className="absolute inset-y-0 flex items-center overflow-hidden rounded-full"
                                style={{ left: `${p.left}%`, width: `${p.width}%`, backgroundColor: tint(p.tone) }}
                            >
                                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${p.progress}%`, backgroundColor: COLORS[p.tone] }} />
                                <span className="relative ml-2 grid size-6 shrink-0 place-items-center rounded-full bg-white/25">
                                    <span className="size-2 rounded-full bg-white" />
                                </span>
                                <span className="relative ml-2 h-2 w-1/3 rounded-full bg-white/50" />
                                <span className="relative ml-auto mr-2 h-5 w-9 rounded-full bg-white" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- Team ---------- */

export function TeamIllustration({ className }: { className?: string }) {
    return (
        <div aria-hidden className={cn('bg-foreground/5 flex flex-col gap-6 rounded-[2rem] p-8', className)}>
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Line className="h-3 w-28" />
                    <Line className="w-16" />
                </div>
                <span className="bg-brand/15 text-brand rounded-full px-3 py-1 text-xs">Responsable</span>
            </div>

            <div className="bg-background flex items-center justify-between rounded-2xl p-4">
                <span className="font-mono text-xl tracking-widest">K7M2QX9A</span>
                <span className="bg-foreground/10 rounded-full px-3 py-1 text-xs">Copier</span>
            </div>

            <div className="flex items-center justify-between">
                <Avatars count={4} className="[&>span]:size-9" />
                <span className="text-muted-foreground text-sm">+3</span>
            </div>
        </div>
    );
}

/* ---------- Review ---------- */

export function ReviewIllustration({ className }: { className?: string }) {
    return (
        <div aria-hidden className={cn('bg-foreground/5 flex flex-col gap-5 rounded-[2rem] p-8', className)}>
            <div className="flex items-center justify-between">
                <Line className="h-3 w-32" />
                <span className="rounded-full px-3 py-1 text-xs" style={{ backgroundColor: tint('review'), color: COLORS.review }}>
                    En review
                </span>
            </div>

            <ul className="space-y-3">
                {[56, 72, 40, 64].map((w) => (
                    <li key={w} className="flex items-center gap-3">
                        <span className="grid size-6 place-items-center rounded-full text-white" style={{ backgroundColor: COLORS.done }}>
                            <Check className="size-3.5" />
                        </span>
                        <Line style-width={w} className="h-2" />
                    </li>
                ))}
            </ul>

            <div className="bg-foreground/10 h-2 overflow-hidden rounded-full">
                <div className="h-full w-full rounded-full" style={{ backgroundColor: COLORS.done }} />
            </div>

            <div className="flex gap-3">
                <span className="bg-brand rounded-full px-5 py-2 text-sm text-white">Valider</span>
                <span className="border-foreground/20 rounded-full border px-5 py-2 text-sm">Renvoyer</span>
            </div>
        </div>
    );
}