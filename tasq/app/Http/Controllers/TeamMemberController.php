<?php

namespace App\Http\Controllers;
use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;


class TeamMemberController extends Controller
{
    //
    public function index(Request $request, Team $team): Response
    {
        Gate::authorize('view', $team);

        $members = $team->members()
            ->orderBy('users.name')
            ->get()
            ->map(fn (User $m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'role' => $m->pivot->role,
                'is_me' => $m->id === $request->user()->id,
            ]);

        return Inertia::render('teams/members', [
            'team' => ['id' => $team->id, 'name' => $team->name],
            'members' => $members,
            'can_manage' => $team->isResponsable($request->user()),
        ]);
    }

    public function store(Request $request, Team $team): RedirectResponse
    {
        Gate::authorize('update', $team);

        $data = $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => "L'e-mail est obligatoire.",
            'email.email' => "Cet e-mail n'est pas valide.",
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => "Aucun compte avec cet e-mail. La personne doit d'abord s'inscrire.",
            ]);
        }

        if ($team->hasMember($user)) {
            throw ValidationException::withMessages(['email' => 'Cette personne est déjà membre de la team.']);
        }

        $team->members()->attach($user->id, ['role' => TeamRole::Collaborateur->value]);

        return back()->with('success', "{$user->name} a été ajouté(e) à la team.");
    }

    public function updateRole(Request $request, Team $team, User $user): RedirectResponse
    {
        Gate::authorize('update', $team);
        abort_unless($team->hasMember($user), 404);

        $data = $request->validate([
            'role' => ['required', Rule::enum(TeamRole::class)],
        ]);

        $isDemotion = $data['role'] === TeamRole::Collaborateur->value;

        if ($isDemotion && $team->isResponsable($user) && $this->responsablesCount($team) <= 1) {
            throw ValidationException::withMessages([
                'member' => "Une team doit toujours avoir au moins un responsable. Promouvez quelqu'un d'autre d'abord.",
            ]);
        }

        $team->members()->updateExistingPivot($user->id, ['role' => $data['role']]);

        return back()->with('success', 'Rôle mis à jour.');
    }

    public function destroy(Request $request, Team $team, User $user): RedirectResponse
    {
        Gate::authorize('update', $team);
        abort_unless($team->hasMember($user), 404);

        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages([
                'member' => 'Pour vous retirer vous-même, utilisez « Quitter la team » sur la page de la team.',
            ]);
        }

        DB::transaction(function () use ($team, $user) {
            // Unassign from this team's tasks only
            $user->tasks()->detach($team->tasks()->pluck('id')->all());
            $team->members()->detach($user->id);
        });

        return back()->with('success', "{$user->name} a été retiré(e) de la team.");
    }

    private function responsablesCount(Team $team): int
    {
        return $team->members()->wherePivot('role', TeamRole::Responsable->value)->count();
    }
}
