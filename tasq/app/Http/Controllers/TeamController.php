<?php

namespace App\Http\Controllers;

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Http\Requests\JoinTeamRequest;
use App\Http\Requests\StoreTeamRequest;
use App\Models\Team;
use App\Services\TeamMembershipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $teams = $request->user()->teams()
            ->withSummary()
            ->orderBy('teams.name')
            ->get()
            ->map(fn (Team $team) => [
                'id' => $team->id,
                'name' => $team->name,
                'role' => $team->pivot->role,
                'members_count' => $team->members_count,
                'tasks_count' => $team->tasks_count,
                'done_tasks_count' => $team->done_tasks_count,
            ]);

        return Inertia::render('teams/index', ['teams' => $teams]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $team = DB::transaction(function () use ($request) {
            $team = Team::create(['name' => $request->validated('name')]);
            $team->members()->attach($request->user()->id, ['role' => TeamRole::Responsable->value]);

            return $team;
        });

        return redirect()->route('teams.show', $team)->with('success', 'Team créée.');
    }

    public function join(JoinTeamRequest $request): RedirectResponse
    {
        $team = Team::where('invite_code', $request->validated('code'))->firstOrFail();

        if ($team->hasMember($request->user())) {
            throw ValidationException::withMessages(['code' => 'Vous êtes déjà membre de cette team.']);
        }

        $team->members()->attach($request->user()->id, ['role' => TeamRole::Collaborateur->value]);

        return redirect()->route('teams.show', $team)->with('success', "Vous avez rejoint {$team->name}.");
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Team $team): Response
    {
        Gate::authorize('view', $team);

        $isResponsable = $team->isResponsable($request->user());

        $team->loadCount([
            'members',
            'tasks',
            'tasks as done_tasks_count' => fn ($q) => $q->where('status', TaskStatus::Faite->value),
        ]);

        return Inertia::render('teams/show', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                // Only the responsable sees the invite code, no one else
                'invite_code' => $isResponsable ? $team->invite_code : null,
                'members_count' => $team->members_count,
                'tasks_count' => $team->tasks_count,
                'done_tasks_count' => $team->done_tasks_count,
            ],
            'my_role' => ($isResponsable ? TeamRole::Responsable : TeamRole::Collaborateur)->value,
            'can' => [
                'update' => $isResponsable,
                'delete' => $isResponsable,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Team $team): RedirectResponse
    {
        Gate::authorize('update', $team);

        $team->update($request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]));

        return back()->with('success', 'Nom mis à jour.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Team $team): RedirectResponse
    {
        Gate::authorize('delete', $team);

        $team->delete(); // foreign keys cascade: tasks, steps, pivots and logs go with it

        return redirect()->route('teams.index')->with('success', 'Team supprimée.');
    }

    public function leave(Request $request, Team $team, TeamMembershipService $memberships): RedirectResponse
    {
        Gate::authorize('view', $team);

        $memberships->leave($team, $request->user());

        return redirect()->route('teams.index')->with('success', "Vous avez quitté {$team->name}.");
    }
}
