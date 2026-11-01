<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = ['team_id', 'user_id', 'task_id', 'action', 'meta'];

    protected $casts = ['meta' => 'array'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /** One-line helper used by the observer and by controllers (assignments, ...). */
    public static function record(int $teamId, ?int $taskId, string $action, array $meta = []): self
    {
        return static::create([
            'team_id' => $teamId,
            'user_id' => auth()->id(), // null when seeding or from the console
            'task_id' => $taskId,
            'action' => $action,
            'meta' => $meta,
        ]);
    }
}