<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    public function show(Request $request, Team $team): Response
    {
        Gate::authorize('view', $team);

        $byStatus = $team->tasks()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $statuses = collect(TaskStatus::cases())->map(fn (TaskStatus $s) => [
            'key' => $s->value,
            'label' => $s->label(),
            'count' => (int) ($byStatus[$s->value] ?? 0),
        ])->values();

        $total = $statuses->sum('count');
        $done = $statuses->firstWhere('key', TaskStatus::Faite->value)['count'];

        $overdueQuery = $team->tasks()
            ->where('status', '!=', TaskStatus::Faite->value)
            ->whereDate('end_date', '<', today());

        $overdueCount = (clone $overdueQuery)->count();
        $overdueTasks = $overdueQuery->orderBy('end_date')->limit(5)->get()->map(fn (Task $t) => $this->task($t));

        $reviewTasks = $team->tasks()
            ->where('status', TaskStatus::Review->value)
            ->orderBy('end_date')
            ->limit(5)
            ->get()
            ->map(fn (Task $t) => $this->task($t));

        $workload = $team->members()
            ->withCount([
                'tasks as open_count' => fn ($q) => $q
                    ->where('tasks.team_id', $team->id)
                    ->where('tasks.status', '!=', TaskStatus::Faite->value),
                'tasks as done_count' => fn ($q) => $q
                    ->where('tasks.team_id', $team->id)
                    ->where('tasks.status', TaskStatus::Faite->value),
            ])
            ->orderBy('users.name')
            ->get()
            ->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
                'role' => $member->pivot->role,
                'open_count' => $member->open_count,
                'done_count' => $member->done_count,
            ]);

        return Inertia::render('teams/overview', [
            'team' => ['id' => $team->id, 'name' => $team->name],
            'statuses' => $statuses,
            'total' => $total,
            'progress' => $total === 0 ? 0 : (int) round($done / $total * 100),
            'overdue_count' => $overdueCount,
            'overdue_tasks' => $overdueTasks,
            'review_tasks' => $reviewTasks,
            'workload' => $workload,
        ]);
    }

    private function task(Task $task): array
    {
        return [
            'id' => $task->id,
            'name' => $task->name,
            'end_date' => $task->end_date?->toDateString(),
        ];
    }
}