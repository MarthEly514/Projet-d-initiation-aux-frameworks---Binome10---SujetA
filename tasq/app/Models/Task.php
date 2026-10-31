<?php

namespace App\Models;

use App\Enums\TaskStatus;
use Database\Factories\TaskFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    /** @use HasFactory<TaskFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'description',
        'status',
        'start_date',
        'end_date',
    ];

    /**
     * The model's default values for attributes.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'a_faire',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TaskStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('is_lead')
            ->withTimestamps();
    }

    /**
     * The assignees marked as lead of this task.
     *
     * @return BelongsToMany<User, $this>
     */
    public function leads(): BelongsToMany
    {
        return $this->assignees()->wherePivot('is_lead', true);
    }

    /**
     * Replace the assignees of the task, keeping a single lead.
     *
     * @param  array<int, int|string>  $collaboratorIds
     */
    public function syncAssignees(int $leadId, array $collaboratorIds = []): void
    {
        $assignees = collect($collaboratorIds)
            ->mapWithKeys(fn (int|string $id) => [(int) $id => ['is_lead' => false]])
            ->put($leadId, ['is_lead' => true]);

        $this->assignees()->sync($assignees->all());
    }

    /**
     * @return HasMany<Step, $this>
     */
    public function steps(): HasMany
    {
        return $this->hasMany(Step::class)->orderBy('position');
    }
}
