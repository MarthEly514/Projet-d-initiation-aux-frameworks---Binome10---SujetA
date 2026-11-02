<?php

use App\Enums\TeamRole;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;

beforeEach(function () {
    $this->responsable = User::factory()->create();
    $this->member = User::factory()->create();

    $this->team = Team::factory()->withResponsable($this->responsable)->create();
    $this->team->members()->attach($this->member, ['role' => TeamRole::Collaborateur->value]);
});

test('a collaborateur leaves the team', function () {
    $this->actingAs($this->member)
        ->post(route('teams.leave', $this->team))
        ->assertRedirect(route('teams.index'));

    expect($this->team->hasMember($this->member))->toBeFalse();
});

test('leaving removes the member from the tasks of this team only', function () {
    $task = Task::factory()->for($this->team)->create();
    $task->syncAssignees($this->member->id);

    $otherTeam = Team::factory()->create();
    $otherTeam->members()->attach($this->member, ['role' => TeamRole::Collaborateur->value]);
    $otherTask = Task::factory()->for($otherTeam)->create();
    $otherTask->syncAssignees($this->member->id);

    $this->actingAs($this->member)->post(route('teams.leave', $this->team));

    expect($task->assignees()->whereKey($this->member->id)->exists())->toBeFalse()
        ->and($otherTask->assignees()->whereKey($this->member->id)->exists())->toBeTrue();
});

test('the only member cannot leave the team', function () {
    $this->team->members()->detach($this->member);

    $this->actingAs($this->responsable)
        ->post(route('teams.leave', $this->team))
        ->assertSessionHasErrors('team');

    expect($this->team->hasMember($this->responsable))->toBeTrue();
});

test('the only responsable cannot leave the team', function () {
    $this->actingAs($this->responsable)
        ->post(route('teams.leave', $this->team))
        ->assertSessionHasErrors('team');

    expect($this->team->hasMember($this->responsable))->toBeTrue();
});

test('a responsable leaves when another one remains', function () {
    $this->team->members()->updateExistingPivot($this->member, ['role' => TeamRole::Responsable->value]);

    $this->actingAs($this->responsable)
        ->post(route('teams.leave', $this->team))
        ->assertRedirect(route('teams.index'));

    expect($this->team->hasMember($this->responsable))->toBeFalse()
        ->and($this->team->isResponsable($this->member))->toBeTrue();
});

test('someone outside the team cannot leave it', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('teams.leave', $this->team))
        ->assertForbidden();
});
