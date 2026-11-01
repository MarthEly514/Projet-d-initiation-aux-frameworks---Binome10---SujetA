<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Models\ActivityLog;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TimelineController extends Controller
{
    public function show(Request $request, Team $team): Response
    {
        Gate::authorize('view', $team);

        $tasks = $team->tasks()
            ->with('assignees')
            ->withCount([
                'steps',
                'steps as done_steps_count' => fn ($q) => $q->where('is_done', true),
            ])
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->orderBy('start_date')
            ->get()
            ->map(fn (Task $t) => [
                'id' => $t->id,
                'name' => $t->name,
                'status' => $t->status->value,
                'start_date' => $t->start_date->toDateString(),
                'end_date' => $t->end_date->toDateString(),
                'assignees' => $t->assignees->pluck('name')->values(),
                'progress' => $t->status === TaskStatus::Faite
                    ? 100
                    : ($t->steps_count === 0 ? 0 : (int) round($t->done_steps_count / $t->steps_count * 100)),
            ]);

        $unscheduled = $team->tasks()
            ->where(fn ($q) => $q->whereNull('start_date')->orWhereNull('end_date'))
            ->count();

        $activity = ActivityLog::where('team_id', $team->id)
            ->with('user:id,name')
            ->latest()
            ->latest('id')
            ->limit(30)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'message' => $this->message($log),
                'at' => $log->created_at->toIso8601String(),
            ]);

        return Inertia::render('teams/timeline', [
            'team' => ['id' => $team->id, 'name' => $team->name],
            'tasks' => $tasks,
            'unscheduled_count' => $unscheduled,
            'activity' => $activity,
        ]);
    }

    private function message(ActivityLog $log): string
    {
        $who = $log->user?->name ?? 'Système';
        $meta = $log->meta ?? [];
        $name = '« '.($meta['name'] ?? 'tâche').' »';

        return match ($log->action) {
            'task.created' => "$who a créé la tâche $name",
            'task.status_changed' => sprintf(
                '%s a passé %s de « %s » à « %s »',
                $who,
                $name,
                TaskStatus::tryFrom($meta['from'] ?? '')?->label() ?? '?',
                TaskStatus::tryFrom($meta['to'] ?? '')?->label() ?? '?',
            ),
            'task.dates_changed' => "$who a modifié les dates de $name",
            'task.updated' => "$who a modifié $name",
            'task.assigned' => "$who a assigné ".($meta['user'] ?? 'un membre')." à $name",
            'task.unassigned' => "$who a retiré ".($meta['user'] ?? 'un membre')." de $name",
            'task.deleted' => "$who a supprimé la tâche $name",
            default => "$who : {$log->action}",
        };
    }
}