<?php

namespace App\Http\Controllers\Tasks;

use App\Http\Controllers\Controller;
use App\Models\Step;
use App\Models\Task;
use App\Services\TaskStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class StepController extends Controller
{
    public function __construct(private TaskStatusService $statuses) {}

    /**
     * Add a step at the end of the task.
     */
    public function store(Request $request, Task $task): RedirectResponse
    {
        Gate::authorize('manageSteps', $task);

        $validated = $this->validateTitle($request);

        DB::transaction(function () use ($task, $validated): void {
            $task->steps()->create([...$validated, 'position' => $task->steps()->max('position') + 1]);

            $this->statuses->recalculate($task);
        });

        return back();
    }

    /**
     * Rename the step.
     */
    public function update(Request $request, Step $step): RedirectResponse
    {
        Gate::authorize('manageSteps', $step->task);

        $step->update($this->validateTitle($request));

        return back();
    }

    /**
     * Delete the step.
     */
    public function destroy(Step $step): RedirectResponse
    {
        Gate::authorize('manageSteps', $step->task);

        DB::transaction(function () use ($step): void {
            $step->delete();

            $this->statuses->recalculate($step->task);
        });

        return back();
    }

    /**
     * Check or uncheck the step.
     */
    public function toggle(Step $step): RedirectResponse
    {
        Gate::authorize('work', $step->task);

        DB::transaction(function () use ($step): void {
            $step->update(['is_done' => ! $step->is_done]);

            $this->statuses->recalculate($step->task);
        });

        return back();
    }

    /**
     * @return array{title: string}
     */
    private function validateTitle(Request $request): array
    {
        return $request->validate(
            ['title' => ['required', 'string', 'max:255']],
            [
                'title.required' => 'Donnez un titre à l’étape.',
                'title.max' => 'Le titre ne doit pas dépasser 255 caractères.',
            ],
        );
    }
}
