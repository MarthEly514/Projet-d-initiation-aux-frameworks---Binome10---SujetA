<?php

namespace App\Http\Requests\Tasks;

use App\Models\Team;

class UpdateTaskRequest extends StoreTaskRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('task'));
    }

    /**
     * The team the task belongs to.
     */
    protected function team(): Team
    {
        return $this->route('task')->team;
    }
}
