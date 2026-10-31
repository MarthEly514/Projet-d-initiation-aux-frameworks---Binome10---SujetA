<?php

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Step;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\QueryException;

test('a new team receives a unique invite code', function () {
    $teams = Team::factory()->count(3)->create();

    expect($teams->pluck('invite_code')->unique())->toHaveCount(3)
        ->and($teams->first()->invite_code)->toHaveLength(8);
});

test('team helpers tell members and responsables apart', function () {
    $responsable = User::factory()->create();
    $collaborateur = User::factory()->create();
    $outsider = User::factory()->create();

    $team = Team::factory()->withResponsable($responsable)->create();
    $team->members()->attach($collaborateur, ['role' => TeamRole::Collaborateur->value]);

    expect($team->hasMember($responsable))->toBeTrue()
        ->and($team->isResponsable($responsable))->toBeTrue()
        ->and($team->hasMember($collaborateur))->toBeTrue()
        ->and($team->isResponsable($collaborateur))->toBeFalse()
        ->and($team->hasMember($outsider))->toBeFalse()
        ->and($team->isResponsable($outsider))->toBeFalse();
});

test('being responsable of one team gives nothing on another team', function () {
    $user = User::factory()->create();

    Team::factory()->withResponsable($user)->create();
    $otherTeam = Team::factory()->withResponsable()->create();

    expect($otherTeam->hasMember($user))->toBeFalse()
        ->and($otherTeam->isResponsable($user))->toBeFalse();
});

test('a task lists its leads apart from its other assignees', function () {
    [$lead, $collaborateur] = User::factory()->count(2)->create();
    $task = Task::factory()->create();

    $task->assignees()->attach($lead, ['is_lead' => true]);
    $task->assignees()->attach($collaborateur);

    expect($task->assignees)->toHaveCount(2)
        ->and($task->leads->pluck('id')->all())->toBe([$lead->id]);
});

test('a user cannot join the same team twice', function () {
    $user = User::factory()->create();
    $team = Team::factory()->withResponsable($user)->create();

    $team->members()->attach($user);
})->throws(QueryException::class);

test('deleting a team deletes its tasks and their steps', function () {
    $team = Team::factory()->withResponsable()->create();
    $task = Task::factory()->for($team)->create();
    Step::factory()->for($task)->create();

    $team->delete();

    expect(Task::count())->toBe(0)
        ->and(Step::count())->toBe(0);
});

test('steps of a task come back in order', function () {
    $task = Task::factory()->create();
    Step::factory()->for($task)->create(['title' => 'Deuxième', 'position' => 2]);
    Step::factory()->for($task)->create(['title' => 'Première', 'position' => 1]);

    expect($task->steps->pluck('title')->all())->toBe(['Première', 'Deuxième']);
});

test('the seeder gives every developer the data agreed on', function () {
    $this->seed(DatabaseSeeder::class);

    expect(User::count())->toBe(5)
        ->and(Team::count())->toBe(2);

    foreach (Team::with('tasks')->get() as $team) {
        $statuses = $team->tasks->map(fn (Task $task) => $task->status)->unique();

        expect($statuses)->toHaveCount(count(TaskStatus::cases()))
            ->and($team->tasks->filter(fn (Task $task) => $task->end_date->isPast()))->toHaveCount(1);
    }
});

test('seeded tasks are all assigned to a member of their team', function () {
    $this->seed(DatabaseSeeder::class);

    foreach (Task::with(['team', 'leads'])->get() as $task) {
        expect($task->leads)->toHaveCount(1)
            ->and($task->team->hasMember($task->leads->first()))->toBeTrue();
    }
});
