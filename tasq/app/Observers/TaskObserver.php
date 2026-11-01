<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\ActivityLog;


class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        //
        ActivityLog::record($task->team_id, $task->id, 'task.created', ['name' => $task->name]);
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        //
        $meta = ['name' => $task->name];

        if ($task->wasChanged('status')) {
            $from = $task->getOriginal('status');
            ActivityLog::record($task->team_id, $task->id, 'task.status_changed', $meta + [
                'from' => $from instanceof \BackedEnum ? $from->value : $from,
                'to' => $task->status->value,
            ]);
        }

        if ($task->wasChanged(['start_date', 'end_date'])) {
            ActivityLog::record($task->team_id, $task->id, 'task.dates_changed', $meta);
        }

        if ($task->wasChanged(['name', 'description'])) {
            ActivityLog::record($task->team_id, $task->id, 'task.updated', $meta);
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        // task_id stays null: the row no longer exists, so the name goes in meta
        ActivityLog::record($task->team_id, null, 'task.deleted', ['name' => $task->name]);
    }

    /**
     * Handle the Task "restored" event.
     */
    public function restored(Task $task): void
    {
        //
    }

    /**
     * Handle the Task "force deleted" event.
     */
    public function forceDeleted(Task $task): void
    {
        //
    }
}
