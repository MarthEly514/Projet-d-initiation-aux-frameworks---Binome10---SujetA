<?php

namespace App\Services;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TeamMembershipService
{
    /**
     * Remove a member from the team, unless it would leave the team without
     * members or without a responsable.
     */
    public function leave(Team $team, User $user): void
    {
        if ($team->members()->count() === 1) {
            throw ValidationException::withMessages([
                'team' => 'Vous êtes le seul membre de cette team : supprimez-la plutôt que de la quitter.',
            ]);
        }

        if ($team->isResponsable($user) && $team->responsables()->count() === 1) {
            throw ValidationException::withMessages([
                'team' => 'Vous êtes le seul responsable : désignez-en un autre avant de partir.',
            ]);
        }

        DB::transaction(function () use ($team, $user) {
            // Unassign from this team's tasks only
            $user->tasks()->detach($team->tasks()->pluck('id')->all());
            $team->members()->detach($user);
        });
    }
}
