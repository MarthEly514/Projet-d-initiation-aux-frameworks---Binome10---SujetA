<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\TaskStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TaskWorkflowController extends Controller
{
    public function __construct(private TaskStatusService $statuses) {}

    /**
     * Send the task to the responsable for validation.
     */
    public function submit(Task $task): RedirectResponse
    {
        Gate::authorize('submit', $task);

        $this->statuses->submit($task);

        return back();
    }

    /**
     * Validate the task.
     */
    public function approve(Task $task): RedirectResponse
    {
        Gate::authorize('review', $task);

        $this->statuses->approve($task);

        return back();
    }

    /**
     * Send the task back with the work to redo.
     */
    public function reject(Request $request, Task $task): RedirectResponse
    {
        Gate::authorize('review', $task);

        $validated = $request->validate(
            ['comment' => ['required', 'string', 'max:2000']],
            [
                'comment.required' => 'Indiquez ce qu’il faut reprendre.',
                'comment.max' => 'Le commentaire ne doit pas dépasser 2000 caractères.',
            ],
        );

        $this->statuses->reject($task, $validated['comment']);

        return back();
    }
}
