<?php

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->responsable = User::factory()->create();
    $this->collaborateur = User::factory()->create();
    $this->outsider = User::factory()->create();

    $this->team = Team::factory()->withResponsable($this->responsable)->create();
    $this->team->members()->attach($this->collaborateur, ['role' => TeamRole::Collaborateur->value]);

    $this->payload = fn (array $overrides = []) => [
        'name' => 'Préparer la démo',
        'description' => 'Pour vendredi',
        'status' => TaskStatus::AFaire->value,
        'start_date' => '2026-11-02',
        'end_date' => '2026-11-06',
        'lead_id' => $this->collaborateur->id,
        'collaborator_ids' => [],
        ...$overrides,
    ];
});

test('guests are redirected to the login page', function () {
    $this->get(route('tasks.index', $this->team))->assertRedirect(route('login'));
});

test('a member sees the tasks of the team without managing them', function () {
    $task = Task::factory()->for($this->team)->create();
    $task->syncAssignees($this->collaborateur->id, [$this->responsable->id]);
    Task::factory()->create();

    $this->actingAs($this->collaborateur)
        ->get(route('tasks.index', $this->team))
        ->assertInertia(fn (Assert $page) => $page
            ->component('tasks/index')
            ->has('tasks', 1)
            ->where('tasks.0.id', $task->id)
            ->where('tasks.0.lead.id', $this->collaborateur->id)
            ->where('tasks.0.collaborators.0.id', $this->responsable->id)
            ->where('canManage', false));
});

test('a responsable can manage the tasks of the team', function () {
    $this->actingAs($this->responsable)
        ->get(route('tasks.index', $this->team))
        ->assertInertia(fn (Assert $page) => $page->where('canManage', true));
});

test('tasks can be filtered by status', function () {
    $done = Task::factory()->for($this->team)->status(TaskStatus::Faite)->create();
    Task::factory()->for($this->team)->status(TaskStatus::EnCours)->create();

    $this->actingAs($this->collaborateur)
        ->get(route('tasks.index', [$this->team, 'status' => 'faite']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks', 1)
            ->where('tasks.0.id', $done->id)
            ->where('filters.status', 'faite'));
});

test('tasks can be filtered by responsible', function () {
    $mine = Task::factory()->for($this->team)->create();
    $mine->syncAssignees($this->collaborateur->id, [$this->responsable->id]);
    $other = Task::factory()->for($this->team)->create();
    $other->syncAssignees($this->responsable->id, [$this->collaborateur->id]);

    $this->actingAs($this->collaborateur)
        ->get(route('tasks.index', [$this->team, 'responsible' => $this->collaborateur->id]))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks', 1)
            ->where('tasks.0.id', $mine->id));
});

test('an unknown status filter shows all the tasks', function () {
    Task::factory()->for($this->team)->count(2)->create();

    $this->actingAs($this->collaborateur)
        ->get(route('tasks.index', [$this->team, 'status' => 'inconnu']))
        ->assertInertia(fn (Assert $page) => $page
            ->has('tasks', 2)
            ->where('filters.status', null));
});

test('a responsable creates a task with its lead and collaborators', function () {
    $this->actingAs($this->responsable)
        ->post(route('tasks.store', $this->team), ($this->payload)([
            'collaborator_ids' => [$this->responsable->id],
        ]))
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $task = $this->team->tasks()->sole();

    expect($task->name)->toBe('Préparer la démo')
        ->and($task->status)->toBe(TaskStatus::AFaire)
        ->and($task->end_date->toDateString())->toBe('2026-11-06')
        ->and($task->leads->pluck('id')->all())->toBe([$this->collaborateur->id])
        ->and($task->assignees)->toHaveCount(2);
});

test('a task stays with a single lead when the lead is also listed as collaborator', function () {
    $this->actingAs($this->responsable)
        ->post(route('tasks.store', $this->team), ($this->payload)([
            'collaborator_ids' => [$this->collaborateur->id],
        ]))
        ->assertSessionHasNoErrors();

    $task = $this->team->tasks()->sole();

    expect($task->assignees)->toHaveCount(1)
        ->and($task->leads)->toHaveCount(1);
});

test('a task cannot be created with invalid data', function (array $overrides, string $field) {
    $this->actingAs($this->responsable)
        ->post(route('tasks.store', $this->team), ($this->payload)($overrides))
        ->assertSessionHasErrors($field);

    expect(Task::count())->toBe(0);
})->with([
    'no name' => [['name' => ''], 'name'],
    'unknown status' => [['status' => 'inconnu'], 'status'],
    'no lead' => [['lead_id' => null], 'lead_id'],
    'due date before start date' => [['end_date' => '2026-11-01'], 'end_date'],
]);

test('the lead of a task must belong to the team', function () {
    $this->actingAs($this->responsable)
        ->post(route('tasks.store', $this->team), ($this->payload)(['lead_id' => $this->outsider->id]))
        ->assertSessionHasErrors('lead_id');

    expect(Task::count())->toBe(0);
});

test('the collaborators of a task must belong to the team', function () {
    $this->actingAs($this->responsable)
        ->post(route('tasks.store', $this->team), ($this->payload)(['collaborator_ids' => [$this->outsider->id]]))
        ->assertSessionHasErrors('collaborator_ids.0');

    expect(Task::count())->toBe(0);
});

test('a member of another team cannot be assigned on update', function () {
    $task = Task::factory()->for($this->team)->create();
    Team::factory()->withResponsable($this->outsider)->create();

    $this->actingAs($this->responsable)
        ->put(route('tasks.update', $task), ($this->payload)(['lead_id' => $this->outsider->id]))
        ->assertSessionHasErrors('lead_id');
});

test('a responsable updates a task and replaces its assignees', function () {
    $task = Task::factory()->for($this->team)->create();
    $task->syncAssignees($this->collaborateur->id);

    $this->actingAs($this->responsable)
        ->put(route('tasks.update', $task), ($this->payload)([
            'name' => 'Démo reportée',
            'status' => TaskStatus::EnCours->value,
            'lead_id' => $this->responsable->id,
        ]))
        ->assertSessionHasNoErrors();

    $task->refresh();

    expect($task->name)->toBe('Démo reportée')
        ->and($task->status)->toBe(TaskStatus::EnCours)
        ->and($task->assignees->pluck('id')->all())->toBe([$this->responsable->id])
        ->and($task->leads->pluck('id')->all())->toBe([$this->responsable->id]);
});

test('a responsable deletes a task', function () {
    $task = Task::factory()->for($this->team)->create();

    $this->actingAs($this->responsable)
        ->delete(route('tasks.destroy', $task))
        ->assertRedirect();

    $this->assertModelMissing($task);
});

test('someone outside the team cannot see its tasks', function () {
    $this->actingAs($this->outsider)
        ->get(route('tasks.index', $this->team))
        ->assertForbidden();
});

test('a collaborateur cannot create, update or delete a task', function () {
    $task = Task::factory()->for($this->team)->create(['name' => 'Inchangée']);

    $this->actingAs($this->collaborateur);

    $this->post(route('tasks.store', $this->team), ($this->payload)())->assertForbidden();
    $this->put(route('tasks.update', $task), ($this->payload)())->assertForbidden();
    $this->delete(route('tasks.destroy', $task))->assertForbidden();

    expect(Task::count())->toBe(1)
        ->and($task->refresh()->name)->toBe('Inchangée');
});

test('the responsable of another team cannot touch these tasks', function () {
    $task = Task::factory()->for($this->team)->create(['name' => 'Inchangée']);
    $rival = User::factory()->create();
    Team::factory()->withResponsable($rival)->create();

    $this->actingAs($rival);

    $this->get(route('tasks.index', $this->team))->assertForbidden();
    $this->post(route('tasks.store', $this->team), ($this->payload)())->assertForbidden();
    $this->put(route('tasks.update', $task), ($this->payload)())->assertForbidden();
    $this->delete(route('tasks.destroy', $task))->assertForbidden();

    expect(Task::count())->toBe(1)
        ->and($task->refresh()->name)->toBe('Inchangée');
});

test('an unauthorized user gets no validation details', function () {
    $this->actingAs($this->outsider)
        ->post(route('tasks.store', $this->team), ['name' => ''])
        ->assertForbidden();
});
