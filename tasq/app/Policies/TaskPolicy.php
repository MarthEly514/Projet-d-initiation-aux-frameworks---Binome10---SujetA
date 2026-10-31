<?php

namespace App\Policies;

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
}
