<?php

namespace App\Services;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Notifications\TaskReadyForReview;
use Illuminate\Support\Facades\Notification;

class TaskStatusService
{
    /**
     * Update the status of a task from its steps.
     *
     * A task without steps keeps its status: it moves with submit() only.
     */
    public function recalculate(Task $task): void
    {
        $total = $task->steps()->count();

        if ($total === 0 || $task->status === TaskStatus::Faite) {
            return;
        }

        $done = $task->steps()->where('is_done', true)->count();
        $wasInReview = $task->status === TaskStatus::Review;

        $task->update(['status' => $this->statusFromSteps($task, $done, $total)]);

        if ($task->status === TaskStatus::Review && ! $wasInReview) {
            $this->notifyResponsables($task);
        }
    }

    /**
     * Send the task to the responsable for validation.
     */
    public function submit(Task $task): void
    {
        $task->status = TaskStatus::Review;
        $task->rejection_comment = null;
        $task->save();

        $this->notifyResponsables($task);
    }

    public function approve(Task $task): void
    {
        $task->status = TaskStatus::Faite;
        $task->save();
    }

    /**
     * Send the task back to its assignees with the work to redo.
     */
    public function reject(Task $task, string $comment): void
    {
        $task->status = TaskStatus::EnCours;
        $task->rejection_comment = $comment;
        $task->save();
    }

    private function notifyResponsables(Task $task): void
    {
        Notification::send($task->team->responsables, new TaskReadyForReview($task));
    }

    /**
     * A rejected task stays in progress until its assignees submit it again.
     */
    private function statusFromSteps(Task $task, int $done, int $total): TaskStatus
    {
        return match (true) {
            $task->isRejected() => TaskStatus::EnCours,
            $done === 0 => TaskStatus::AFaire,
            $done < $total => TaskStatus::EnCours,
            default => TaskStatus::Review,
        };
    }
}
