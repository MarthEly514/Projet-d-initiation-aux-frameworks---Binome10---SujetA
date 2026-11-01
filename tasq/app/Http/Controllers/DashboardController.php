<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        $teams = $user->teams()
            ->withSummary()
            ->orderBy('teams.name')
            ->get()
            ->map(fn (Team $team) => [
                'id' => $team->id,
                'name' => $team->name,
                'role' => $team->pivot->role,
                'members_count' => $team->members_count,
                'tasks_count' => $team->tasks_count,
                'done_tasks_count' => $team->done_tasks_count,
            ]);

        // My tasks = tasks I'm assigned to, across all my teams
        $byStatus = $user->tasks()
            ->selectRaw('tasks.status, count(*) as total')
            ->groupBy('tasks.status')
            ->pluck('total', 'status');

        $counts = collect(TaskStatus::cases())
            ->mapWithKeys(fn (TaskStatus $s) => [$s->value => (int) ($byStatus[$s->value] ?? 0)]);

        $overdue = $user->tasks()
            ->where('tasks.status', '!=', TaskStatus::Faite->value)
            ->whereDate('tasks.end_date', '<', today())
            ->count();

        $upcoming = $user->tasks()
            ->with('team:id,name')
            ->where('tasks.status', '!=', TaskStatus::Faite->value)
            ->orderByRaw('tasks.end_date is null')
            ->orderBy('tasks.end_date')
            ->limit(6)
            ->get()
            ->map(fn ($task) => [
                'id' => $task->id,
                'name' => $task->name,
                'status' => $task->status->value,
                'end_date' => $task->end_date?->toDateString(),
                'is_overdue' => $task->end_date?->isPast() && ! $task->end_date->isToday(),
                'team_name' => $task->team->name,
            ]);

        return Inertia::render('dashboard', [
            'teams' => $teams,
            'counts' => $counts,
            'overdue' => $overdue,
            'upcoming' => $upcoming,
        ]);
    }
}