import { differenceInCalendarDays, parseISO } from 'date-fns';

import { type GanttTask } from '@/types/timeline';

export type PlacedTask = GanttTask & { lane: number; offset: number; span: number };

/**
 * Lays out the tasks visible in one month (dayCount days starting at monthStart).
 * Greedy packing: sorted by start date, each task goes in the first lane whose
 * last bar ended before it starts, otherwise a new lane opens.
 * `offset` and `span` are in days, clamped to the month.
 */
export function layoutTasks(tasks: GanttTask[], monthStart: Date, dayCount: number) {
    const last = dayCount - 1;

    const visible = tasks
        .map((t) => {
            const start = differenceInCalendarDays(parseISO(t.start_date), monthStart);
            const end = Math.max(differenceInCalendarDays(parseISO(t.end_date), monthStart), start);
            return { t, start, end };
        })
        .filter((x) => x.end >= 0 && x.start <= last)
        .sort((a, b) => a.start - b.start || a.end - b.end);

    const laneEnds: number[] = [];

    const placed: PlacedTask[] = visible.map(({ t, start, end }) => {
        const s = Math.max(start, 0);
        const e = Math.min(end, last);

        let lane = laneEnds.findIndex((lastEnd) => lastEnd < s);
        if (lane === -1) {
            lane = laneEnds.length;
            laneEnds.push(e);
        } else {
            laneEnds[lane] = e;
        }

        return { ...t, lane, offset: s, span: e - s + 1 };
    });

    return { placed, laneCount: laneEnds.length };
}