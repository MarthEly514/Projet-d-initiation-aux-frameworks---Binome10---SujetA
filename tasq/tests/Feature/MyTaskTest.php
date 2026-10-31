<?php

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->teamA = Team::factory()->withResponsable()->create(['name' => 'Alpha']);
    $this->teamB = Team::factory()->withResponsable()->create(['name' => 'Bravo']);
    $this->teamA->members()->attach($this->user, ['role' => TeamRole::Collaborateur->value]);
    $this->teamB->members()->attach($this->user, ['role' => TeamRole::Collaborateur->value]);

    $this->assignedTask = function (Team $team, array $attributes = []) {
        $task = Task::factory()->for($team)->create($attributes);
        $task->syncAssignees($this->user->id);

        return $task;
    };
});

test('guests are redirected to the login page', function () {
    $this->get(route('my-tasks'))->assertRedirect(route('login'));
});

test('a user sees their tasks from all their teams', function () {
    $first = ($this->assignedTask)($this->teamA);
    $second = ($this->assignedTask)($this->teamB);

    $this->actingAs($this->user)
        ->get(route('my-tasks'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('my-tasks')
            ->has('tasks', 2)
            ->where('tasks', fn ($tasks) => collect($tasks)->pluck('id')->sort()->values()->all() === [$first->id, $second->id])
            ->where('tasks.0.team.name', fn ($name) => in_array($name, ['Alpha', 'Bravo']))
            ->has('teams', 2));
});

test('a task where the user is a collaborateur is listed too', function () {
    $task = Task::factory()->for($this->teamA)->create();
    $task->syncAssignees($this->teamA->members()->wherePivot('role', 'responsable')->first()->id, [$this->user->id]);

    $this->actingAs($this->user)
        ->get(route('my-tasks'))
        ->assertInertia(fn (Assert $page) => $page->where('tasks.0.id', $task->id));
});

test('tasks assigned to someone else are not listed', function () {
    $task = Task::factory()->for($this->teamA)->create();
    $task->syncAssignees(User::factory()->create()->id);

    $this->actingAs($this->user)
        ->get(route('my-tasks'))
        ->assertInertia(fn (Assert $page) => $page->has('tasks', 0));
});

test('tasks of a team the user left are not listed', function () {
    ($this->assignedTask)($this->teamA);
    $this->teamA->members()->detach($this->user);

    $this->actingAs($this->user)
        ->get(route('my-tasks'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks', 0)
            ->has('teams', 1));
});

test('the soonest due date comes first and tasks without a date come last', function () {
    $later = ($this->assignedTask)($this->teamA, ['end_date' => '2026-12-20']);
    $withoutDate = ($this->assignedTask)($this->teamB, ['end_date' => null]);
    $sooner = ($this->assignedTask)($this->teamB, ['end_date' => '2026-12-01']);

    $this->actingAs($this->user)
        ->get(route('my-tasks'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('tasks.0.id', $sooner->id)
            ->where('tasks.1.id', $later->id)
            ->where('tasks.2.id', $withoutDate->id));
});

test('tasks can be filtered by status', function () {
    $done = ($this->assignedTask)($this->teamA, ['status' => TaskStatus::Faite]);
    ($this->assignedTask)($this->teamA, ['status' => TaskStatus::EnCours]);

    $this->actingAs($this->user)
        ->get(route('my-tasks', ['status' => 'faite']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks', 1)
            ->where('tasks.0.id', $done->id)
            ->where('filters.status', 'faite'));
});

test('tasks can be filtered by team', function () {
    $task = ($this->assignedTask)($this->teamB);
    ($this->assignedTask)($this->teamA);

    $this->actingAs($this->user)
        ->get(route('my-tasks', ['team' => $this->teamB->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks', 1)
            ->where('tasks.0.id', $task->id)
            ->where('filters.team', $this->teamB->id));
});

test('a team the user does not belong to is ignored as a filter', function () {
    ($this->assignedTask)($this->teamA);
    $otherTeam = Team::factory()->withResponsable()->create();
    Task::factory()->for($otherTeam)->create();

    $this->actingAs($this->user)
        ->get(route('my-tasks', ['team' => $otherTeam->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks', 1)
            ->where('filters.team', null));
});
