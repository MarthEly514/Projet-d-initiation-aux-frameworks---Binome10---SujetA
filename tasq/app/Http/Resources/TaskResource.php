<?php

namespace App\Http\Resources;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Task
 */
class TaskResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        [$leads, $collaborators] = $this->assignees->partition(fn (User $user) => (bool) $user->pivot->is_lead);
        $summary = fn (User $user) => ['id' => $user->id, 'name' => $user->name];

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'lead' => $leads->map($summary)->first(),
            'collaborators' => $collaborators->map($summary)->values()->all(),
        ];
    }
}
