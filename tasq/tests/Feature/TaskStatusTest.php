<?php

use App\Enums\TaskStatus;
use App\Models\Step;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Services\TaskStatusService;

beforeEach(function () {
    $this->team = Team::factory()->withResponsable(User::factory()->create())->create();
    $this->task = Task::factory()->for($this->team)->status(TaskStatus::AFaire)->create();
    $this->service = app(TaskStatusService::class);

    $this->addSteps = fn (int $count, int $done) => collect(range(1, $count))->each(
        fn (int $position) => Step::factory()->for($this->task)->create([
            'position' => $position,
            'is_done' => $position <= $done,
        ]),
    );
});

test('the status is computed from the steps', function (int $total, int $done, TaskStatus $expected) {
    ($this->addSteps)($total, $done);

    $this->service->recalculate($this->task);

    expect($this->task->fresh()->status)->toBe($expected);
})->with([
    'none done' => [3, 0, TaskStatus::AFaire],
    'some done' => [3, 2, TaskStatus::EnCours],
    'all done' => [3, 3, TaskStatus::Review],
]);

test('a task without steps keeps its status', function () {
    $this->task->update(['status' => TaskStatus::EnCours]);

    $this->service->recalculate($this->task);

    expect($this->task->fresh()->status)->toBe(TaskStatus::EnCours);
});

test('a finished task never moves', function () {
    $this->task->update(['status' => TaskStatus::Faite]);
    ($this->addSteps)(2, 1);

    $this->service->recalculate($this->task);

    expect($this->task->fresh()->status)->toBe(TaskStatus::Faite);
});

test('approve finishes the task', function () {
    $this->task->update(['status' => TaskStatus::Review]);

    $this->service->approve($this->task);

    expect($this->task->fresh()->status)->toBe(TaskStatus::Faite);
});

test('reject keeps the comment and submit clears it', function () {
    $this->task->update(['status' => TaskStatus::Review]);

    $this->service->reject($this->task, 'À reprendre');

    expect($this->task->fresh())
        ->status->toBe(TaskStatus::EnCours)
        ->rejection_comment->toBe('À reprendre');

    $this->service->submit($this->task);

    expect($this->task->fresh())
        ->status->toBe(TaskStatus::Review)
        ->rejection_comment->toBeNull();
});
