import { Link } from '@inertiajs/react';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameMonth, isToday, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/tasq/button';
import { layoutTasks } from '@/lib/gantt';
import { cn } from '@/lib/utils';
import { type GanttTask } from '@/types/timeline';

const LANE_H = 64;
const BAR_H = 48;
const MIN_DAY_W = 32;

const COLORS: Record<GanttTask['status'], string> = {
    a_faire: '#9f5bfe',
    en_cours: '#1a8fe8',
    review: '#f14f1e',
    faite: '#0ace82',
};

export function Gantt({ tasks }: { tasks: GanttTask[] }) {
    const [month, setMonth] = useState(() => startOfMonth(new Date()));

    const { days, placed, laneCount } = useMemo(() => {
        const days = eachDayOfInterval({ start: month, end: endOfMonth(month) });
        return { days, ...layoutTasks(tasks, month, days.length) };
    }, [tasks, month]);

    const n = days.length;
    const todayIndex = days.findIndex((d) => isToday(d));
    const label = format(month, 'MMMM yyyy', { locale: fr });

    return (
        <div className="flex flex-col gap-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                    <span className="mr-2 text-sm font-medium capitalize">{label}</span>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Mois précédent">
                        <ChevronLeft />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Mois suivant">
                        <ChevronRight />
                    </Button>
                </div>
                <Button variant="outline" size="sm" disabled={isSameMonth(month, new Date())} onClick={() => setMonth(startOfMonth(new Date()))}>
                    Aujourd'hui
                </Button>
            </div>

            <div className="overflow-x-auto">
                <div style={{ minWidth: n * MIN_DAY_W }}>
                    {/* Days */}
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                        {days.map((d) => (
                            <div key={d.toISOString()} className="flex justify-center py-2">
                                <span
                                    className={cn(
                                        'text-xs',
                                        isToday(d) ? 'bg-brand rounded-full px-2.5 py-1 font-semibold text-white' : 'text-muted-foreground py-1',
                                    )}
                                >
                                    {isToday(d) ? `${format(d, 'EEEEE', { locale: fr }).toUpperCase()} ${format(d, 'd')}` : format(d, 'dd')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Body */}
                    <div className="relative" style={{ height: Math.max(laneCount, 3) * LANE_H + 16 }}>
                        {/* Dashed day lines */}
                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
                            {days.map((d) => (
                                <div key={d.toISOString()} className="border-foreground/10 border-l border-dashed" />
                            ))}
                        </div>

                        {/* Today line */}
                        {todayIndex >= 0 && (
                            <div className="bg-brand pointer-events-none absolute top-0 bottom-0 z-10 w-px" style={{ left: `${((todayIndex + 0.5) / n) * 100}%` }}>
                                <span className="bg-brand absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full" />
                            </div>
                        )}

                        {placed.length === 0 && (
                            <p className="text-muted-foreground absolute inset-0 grid place-items-center text-sm">Aucune tâche ce mois-ci.</p>
                        )}

                        {/* Task pills */}
                        {placed.map((t) => {
                            const color = COLORS[t.status];
                            return (
                                <Link
                                    key={t.id}
                                    href={route('tasks.show', t.id)}
                                    title={`${t.name} · ${t.progress}%${t.assignees.length ? ` · ${t.assignees.join(', ')}` : ''}`}
                                    className="@container absolute overflow-hidden rounded-full text-white transition-opacity hover:opacity-90"
                                    style={{
                                        left: `calc(${(t.offset / n) * 100}% + 2px)`,
                                        width: `calc(${(t.span / n) * 100}% - 4px)`,
                                        top: t.lane * LANE_H + 8,
                                        height: BAR_H,
                                        backgroundColor: `color-mix(in oklab, ${color} 22%, transparent)`,
                                    }}
                                >
                                    {/* Progress fill */}
                                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${t.progress}%`, backgroundColor: color }} />

                                    {/* Content */}
                                    <span className="relative flex h-full items-center gap-2 px-2">
                                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/25">
                                            <span className="size-2.5 rounded-full bg-white" />
                                        </span>
                                        <span className="flex-1 truncate text-sm font-medium">{t.name}</span>
                                        <span className="hidden h-8 min-w-12 place-items-center rounded-full bg-white px-2 text-xs font-semibold text-black @[9rem]:grid">
                                            {t.progress}%
                                        </span>
                                        <ChevronRight className="hidden size-4 shrink-0 opacity-60 @[9rem]:block" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}