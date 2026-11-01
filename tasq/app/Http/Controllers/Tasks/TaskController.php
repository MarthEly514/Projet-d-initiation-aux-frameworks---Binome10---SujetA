<?php

namespace App\Http\Controllers\Tasks;

use App\Enums\TaskStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tasks\StoreTaskRequest;
use App\Http\Requests\Tasks\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Show the tasks of a team, filtered by status or responsible.
     */
    public function index(Request $request, Team $team): Response
    {
        Gate::authorize('viewAny', [Task::class, $team]);

        $status = TaskStatus::tryFrom($request->string('status')->toString());
        $responsibleId = $request->integer('responsible') ?: null;

        $tasks = $team->tasks()
            ->with('assignees')
            ->withCount([
                'steps',
                'steps as done_steps_count' => fn ($q) => $q->where('is_done', true),
            ])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($responsibleId, fn ($query) => $query->whereHas('leads', fn ($leads) => $leads->whereKey($responsibleId)))
            ->latest('id')
            ->get();

        return Inertia::render('tasks/index', [
            'team' => $team->only('id', 'name'),
            'tasks' => TaskResource::collection($tasks)->resolve(),
            'members' => $team->members()->orderBy('name')->get()->map(fn (User $user) => $user->only('id', 'name')),
            'statuses' => TaskStatus::options(),
            'filters' => ['status' => $status?->value, 'responsible' => $responsibleId],
            'canManage' => $request->user()->can('create', [Task::class, $team]),
        ]);
    }

    /**
     * Show a task with its steps and what the user can do on it.
     */
    public function show(Request $request, Task $task): Response
    {
        Gate::authorize('view', $task);

        $user = $request->user();

        return Inertia::render('tasks/show', [
            'team' => $task->team->only('id', 'name'),
            'task' => (new TaskResource($task->load(['assignees', 'steps'])))->resolve(),
            'can' => [
                'manageSteps' => $user->can('manageSteps', $task),
                'work' => $user->can('work', $task),
                'submit' => $user->can('submit', $task),
                'review' => $user->can('review', $task),
            ],
        ]);
    }

    /**
     * Create a task in the team.
     */
    public function store(StoreTaskRequest $request, Team $team): RedirectResponse
    {
        DB::transaction(function () use ($request, $team): void {
            $task = $team->tasks()->create($request->safe()->except(['lead_id', 'collaborator_ids']));

            $task->syncAssignees($request->integer('lead_id'), $request->validated('collaborator_ids', []));
        });

        return back();
    }

    /**
     * Update the task.
     */
    public function update(UpdateTaskRequest $request, Task $task): RedirectResponse
    {
        DB::transaction(function () use ($request, $task): void {
            $task->update($request->safe()->except(['lead_id', 'collaborator_ids']));

            $task->syncAssignees($request->integer('lead_id'), $request->validated('collaborator_ids', []));
        });

        return back();
    }

    /**
     * Delete the task.
     */
    public function destroy(Task $task): RedirectResponse
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return back();
    }
}
