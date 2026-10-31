<?php

namespace App\Models;

use App\Enums\TeamRole;
use Database\Factories\TeamFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Team extends Model
{
    /** @use HasFactory<TeamFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'invite_code',
    ];

    /**
     * Give every new team an invite code.
     */
    protected static function booted(): void
    {
        static::creating(function (Team $team): void {
            $team->invite_code ??= static::generateInviteCode();
        });
    }

    /**
     * Generate an invite code that no team uses yet.
     */
    public static function generateInviteCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (static::query()->where('invite_code', $code)->exists());

        return $code;
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * @return HasMany<Task, $this>
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function hasMember(User $user): bool
    {
        return $this->members()->whereKey($user->id)->exists();
    }

    public function isResponsable(User $user): bool
    {
        return $this->members()
            ->whereKey($user->id)
            ->wherePivot('role', TeamRole::Responsable->value)
            ->exists();
    }
}
