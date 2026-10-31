<?php

namespace App\Policies;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;

class TaskPolicy
{
    /**
     * Any member of the team can list its tasks.
     */
    public function viewAny(User $user, Team $team): bool
    {
        return $team->hasMember($user);
    }

    /**
     * Any member of the team can open one of its tasks.
     */
    public function view(User $user, Task $task): bool
    {
        return $task->team->hasMember($user);
    }

    /**
     * Only a responsable of the team can create a task in it.
     */
    public function create(User $user, Team $team): bool
    {
        return $team->isResponsable($user);
    }

    /**
     * Only a responsable of the task's team can update it.
     */
    public function update(User $user, Task $task): bool
    {
        return $task->team->isResponsable($user);
    }

    /**
     * Only a responsable of the task's team can delete it.
     */
    public function delete(User $user, Task $task): bool
    {
        return $task->team->isResponsable($user);
    }

    /**
     * Only a responsable can change the steps of an unfinished task.
     */
    public function manageSteps(User $user, Task $task): bool
    {
        return $task->status !== TaskStatus::Faite && $task->team->isResponsable($user);
    }

    /**
     * Only the assignees can check the steps of an unfinished task.
     */
    public function work(User $user, Task $task): bool
    {
        return $task->status !== TaskStatus::Faite
            && $task->team->hasMember($user)
            && $task->assignees()->whereKey($user->id)->exists();
    }

    /**
     * An assignee can submit the task once all its steps are done.
     */
    public function submit(User $user, Task $task): bool
    {
        return $task->status !== TaskStatus::Review
            && $this->work($user, $task)
            && $task->steps()->where('is_done', false)->doesntExist();
    }

    /**
     * Only a responsable can approve or reject a task waiting for review.
     */
    public function review(User $user, Task $task): bool
    {
        return $task->status === TaskStatus::Review && $task->team->isResponsable($user);
    }
}
