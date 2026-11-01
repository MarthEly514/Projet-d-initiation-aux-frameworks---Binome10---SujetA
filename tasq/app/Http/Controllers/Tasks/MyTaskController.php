<?php

namespace App\Http\Controllers\Tasks;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\TaskResource;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyTaskController extends Controller
{
    /**
     * Show the tasks assigned to the user in all their teams, soonest due date first.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $teams = $user->teams()->orderBy('name')->get();

        $status = TaskStatus::tryFrom($request->string('status')->toString());
        $teamId = $teams->find($request->integer('team'))?->id;

        $tasks = $user->tasks()
            ->with(['assignees', 'team'])
            ->whereIn('team_id', $teams->modelKeys())
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($teamId, fn ($query) => $query->where('team_id', $teamId))
            ->orderByRaw('end_date is null')
            ->orderBy('end_date')
            ->latest('tasks.id')
            ->get();

        return Inertia::render('my-tasks', [
            'tasks' => TaskResource::collection($tasks)->resolve(),
            'teams' => $teams->map(fn (Team $team) => $team->only('id', 'name')),
            'statuses' => TaskStatus::options(),
            'filters' => ['status' => $status?->value, 'team' => $teamId],
        ]);
    }
}
