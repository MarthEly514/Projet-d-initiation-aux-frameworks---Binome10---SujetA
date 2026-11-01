<?php

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Step;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;

beforeEach(function () {
    $this->responsable = User::factory()->create();
    $this->assignee = User::factory()->create();
    $this->member = User::factory()->create();
    $this->outsider = User::factory()->create();

    $this->team = Team::factory()->withResponsable($this->responsable)->create();
    $this->team->members()->attach($this->assignee, ['role' => TeamRole::Collaborateur->value]);
    $this->team->members()->attach($this->member, ['role' => TeamRole::Collaborateur->value]);

    $this->makeTask = function (TaskStatus $status = TaskStatus::AFaire) {
        $task = Task::factory()->for($this->team)->status($status)->create();
        $task->syncAssignees($this->assignee->id);

        return $task;
    };
});

test('who can use a task', function (string $ability, array $allowed) {
    $task = ($this->makeTask)();

    foreach (['responsable', 'assignee', 'member', 'outsider'] as $actor) {
        expect($this->{$actor}->can($ability, $task))->toBe(in_array($actor, $allowed), "{$actor} : {$ability}");
    }
})->with([
    'view' => ['view', ['responsable', 'assignee', 'member']],
    'update' => ['update', ['responsable']],
    'delete' => ['delete', ['responsable']],
    'manageSteps' => ['manageSteps', ['responsable']],
    'work' => ['work', ['assignee']],
    'submit' => ['submit', ['assignee']],
]);

test('who can list and create tasks in a team', function (string $actor, bool $list, bool $create) {
    expect($this->{$actor}->can('viewAny', [Task::class, $this->team]))->toBe($list)
        ->and($this->{$actor}->can('create', [Task::class, $this->team]))->toBe($create);
})->with([
    ['responsable', true, true],
    ['member', true, false],
    ['outsider', false, false],
]);

test('a finished task is locked', function () {
    $task = ($this->makeTask)(TaskStatus::Faite);

    expect($this->responsable->can('manageSteps', $task))->toBeFalse()
        ->and($this->assignee->can('work', $task))->toBeFalse()
        ->and($this->assignee->can('submit', $task))->toBeFalse();
});

test('a task cannot be submitted while a step is unchecked', function () {
    $task = ($this->makeTask)();
    Step::factory()->for($task)->create(['is_done' => false]);

    expect($this->assignee->can('submit', $task))->toBeFalse();
});

test('only a task in review can be reviewed, by a responsable', function () {
    $task = ($this->makeTask)(TaskStatus::Review);

    expect($this->responsable->can('review', $task))->toBeTrue()
        ->and($this->assignee->can('review', $task))->toBeFalse()
        ->and($this->assignee->can('submit', $task))->toBeFalse()
        ->and($this->responsable->can('review', ($this->makeTask)(TaskStatus::EnCours)))->toBeFalse();
});
