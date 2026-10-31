<?php

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Step;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->responsable = User::factory()->create();
    $this->assignee = User::factory()->create();
    $this->member = User::factory()->create();
    $this->outsider = User::factory()->create();

    $this->team = Team::factory()->withResponsable($this->responsable)->create();
    $this->team->members()->attach($this->assignee, ['role' => TeamRole::Collaborateur->value]);
    $this->team->members()->attach($this->member, ['role' => TeamRole::Collaborateur->value]);

    $this->task = Task::factory()->for($this->team)->create();
    $this->task->syncAssignees($this->assignee->id);

    $this->addSteps = fn (int $count, int $done = 0) => collect(range(1, $count))->map(
        fn (int $position) => Step::factory()->for($this->task)->create([
            'position' => $position,
            'is_done' => $position <= $done,
        ]),
    );
});

test('a member opens a task with its steps', function () {
    ($this->addSteps)(2, 1);

    $this->actingAs($this->member)
        ->get(route('tasks.show', $this->task))
        ->assertInertia(fn (Assert $page) => $page
            ->component('tasks/show')
            ->has('task.steps', 2)
            ->where('task.steps.0.is_done', true)
            ->where('can.work', false)
            ->where('can.manageSteps', false));
});

test('someone outside the team cannot open a task', function () {
    $this->actingAs($this->outsider)
        ->get(route('tasks.show', $this->task))
        ->assertForbidden();
});

test('the status follows the checked steps', function (int $done, TaskStatus $expected) {
    $steps = ($this->addSteps)(3, $done - 1);

    $this->actingAs($this->assignee)
        ->patch(route('steps.toggle', $steps[$done - 1]))
        ->assertRedirect();

    expect($this->task->refresh()->status)->toBe($expected);
})->with([
    'one of three' => [1, TaskStatus::EnCours],
    'two of three' => [2, TaskStatus::EnCours],
    'all three' => [3, TaskStatus::Review],
]);

test('unchecking the last step puts the task back to do', function () {
    $steps = ($this->addSteps)(2, 1);
    $this->task->update(['status' => TaskStatus::EnCours]);

    $this->actingAs($this->assignee)->patch(route('steps.toggle', $steps[0]));

    expect($this->task->refresh()->status)->toBe(TaskStatus::AFaire);
});

test('unchecking a step takes the task out of review', function () {
    $steps = ($this->addSteps)(2, 2);
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->assignee)->patch(route('steps.toggle', $steps[1]));

    expect($this->task->refresh()->status)->toBe(TaskStatus::EnCours);
});

test('only an assignee can check a step', function (string $actor) {
    $step = ($this->addSteps)(1)->first();

    $this->actingAs($this->{$actor})
        ->patch(route('steps.toggle', $step))
        ->assertForbidden();

    expect($step->refresh()->is_done)->toBeFalse();
})->with(['responsable', 'member', 'outsider']);

test('an assignee removed from the team cannot check a step', function () {
    $step = ($this->addSteps)(1)->first();
    $this->team->members()->detach($this->assignee);

    $this->actingAs($this->assignee)
        ->patch(route('steps.toggle', $step))
        ->assertForbidden();
});

test('the steps of a finished task are locked', function () {
    $step = ($this->addSteps)(1, 1)->first();
    $this->task->update(['status' => TaskStatus::Faite]);

    $this->actingAs($this->assignee)->patch(route('steps.toggle', $step))->assertForbidden();

    $this->actingAs($this->responsable);
    $this->post(route('steps.store', $this->task), ['title' => 'Encore'])->assertForbidden();
    $this->put(route('steps.update', $step), ['title' => 'Autre'])->assertForbidden();
    $this->delete(route('steps.destroy', $step))->assertForbidden();
});

test('a responsable adds a step at the end of the task', function () {
    ($this->addSteps)(2);

    $this->actingAs($this->responsable)
        ->post(route('steps.store', $this->task), ['title' => 'Dernière'])
        ->assertSessionHasNoErrors();

    expect($this->task->steps()->get()->last()->title)->toBe('Dernière');
});

test('a step needs a title', function () {
    $this->actingAs($this->responsable)
        ->post(route('steps.store', $this->task), ['title' => ''])
        ->assertSessionHasErrors('title');

    expect($this->task->steps()->count())->toBe(0);
});

test('adding a step takes a finished work out of review', function () {
    ($this->addSteps)(1, 1);
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->responsable)
        ->post(route('steps.store', $this->task), ['title' => 'Oubliée']);

    expect($this->task->refresh()->status)->toBe(TaskStatus::EnCours);
});

test('deleting the only unchecked step sends the task to review', function () {
    $steps = ($this->addSteps)(2, 1);
    $this->task->update(['status' => TaskStatus::EnCours]);

    $this->actingAs($this->responsable)
        ->delete(route('steps.destroy', $steps[1]))
        ->assertRedirect();

    expect($this->task->refresh()->status)->toBe(TaskStatus::Review);
});

test('a responsable renames a step', function () {
    $step = ($this->addSteps)(1)->first();

    $this->actingAs($this->responsable)
        ->put(route('steps.update', $step), ['title' => 'Nouveau titre'])
        ->assertSessionHasNoErrors();

    expect($step->refresh()->title)->toBe('Nouveau titre');
});

test('a collaborateur cannot change the steps', function () {
    $step = ($this->addSteps)(1)->first();

    $this->actingAs($this->assignee);

    $this->post(route('steps.store', $this->task), ['title' => 'Non'])->assertForbidden();
    $this->put(route('steps.update', $step), ['title' => 'Non'])->assertForbidden();
    $this->delete(route('steps.destroy', $step))->assertForbidden();
});

test('the responsable of another team cannot touch the steps or the review', function () {
    $step = ($this->addSteps)(1, 1)->first();
    $this->task->update(['status' => TaskStatus::Review]);
    $rival = User::factory()->create();
    Team::factory()->withResponsable($rival)->create();

    $this->actingAs($rival);

    $this->patch(route('steps.toggle', $step))->assertForbidden();
    $this->delete(route('steps.destroy', $step))->assertForbidden();
    $this->post(route('tasks.approve', $this->task))->assertForbidden();
    $this->post(route('tasks.reject', $this->task), ['comment' => 'Non'])->assertForbidden();

    expect($this->task->refresh()->status)->toBe(TaskStatus::Review);
});

test('an assignee finishes a task without steps with a single click', function () {
    $this->actingAs($this->assignee)
        ->post(route('tasks.submit', $this->task))
        ->assertRedirect();

    expect($this->task->refresh()->status)->toBe(TaskStatus::Review);
});

test('only an assignee can finish a task without steps', function (string $actor) {
    $this->actingAs($this->{$actor})
        ->post(route('tasks.submit', $this->task))
        ->assertForbidden();

    expect($this->task->refresh()->status)->toBe(TaskStatus::AFaire);
})->with(['responsable', 'member', 'outsider']);

test('a task with unchecked steps cannot be submitted', function () {
    ($this->addSteps)(2, 1);

    $this->actingAs($this->assignee)
        ->post(route('tasks.submit', $this->task))
        ->assertForbidden();
});

test('a responsable validates a task in review', function () {
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->responsable)
        ->post(route('tasks.approve', $this->task))
        ->assertRedirect();

    expect($this->task->refresh()->status)->toBe(TaskStatus::Faite);
});

test('a task cannot be reviewed before it is submitted', function () {
    $this->actingAs($this->responsable);

    $this->post(route('tasks.approve', $this->task))->assertForbidden();
    $this->post(route('tasks.reject', $this->task), ['comment' => 'Non'])->assertForbidden();

    expect($this->task->refresh()->status)->toBe(TaskStatus::AFaire);
});

test('a collaborateur cannot validate or reject a task', function () {
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->assignee);

    $this->post(route('tasks.approve', $this->task))->assertForbidden();
    $this->post(route('tasks.reject', $this->task), ['comment' => 'Non'])->assertForbidden();

    expect($this->task->refresh()->status)->toBe(TaskStatus::Review);
});

test('rejecting a task needs a comment', function () {
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->responsable)
        ->post(route('tasks.reject', $this->task), ['comment' => ''])
        ->assertSessionHasErrors('comment');

    expect($this->task->refresh()->status)->toBe(TaskStatus::Review);
});

test('a rejected task goes back in progress with the comment and its checked steps', function () {
    ($this->addSteps)(2, 2);
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->responsable)
        ->post(route('tasks.reject', $this->task), ['comment' => 'Reprendre l’étape 2'])
        ->assertSessionHasNoErrors();

    $task = $this->task->refresh();

    expect($task->status)->toBe(TaskStatus::EnCours)
        ->and($task->rejection_comment)->toBe('Reprendre l’étape 2')
        ->and($task->steps()->where('is_done', true)->count())->toBe(2);
});

test('a rejected task does not return to review by itself', function () {
    $steps = ($this->addSteps)(2, 2);
    $this->task->forceFill(['status' => TaskStatus::EnCours, 'rejection_comment' => 'À reprendre'])->save();

    $this->actingAs($this->assignee);

    $this->patch(route('steps.toggle', $steps[1]));
    $this->patch(route('steps.toggle', $steps[1]));

    expect($this->task->refresh()->status)->toBe(TaskStatus::EnCours);
});

test('an assignee submits a rejected task again and the comment disappears', function () {
    ($this->addSteps)(1, 1);
    $this->task->forceFill(['status' => TaskStatus::EnCours, 'rejection_comment' => 'À reprendre'])->save();

    $this->actingAs($this->assignee)
        ->post(route('tasks.submit', $this->task))
        ->assertRedirect();

    $task = $this->task->refresh();

    expect($task->status)->toBe(TaskStatus::Review)
        ->and($task->rejection_comment)->toBeNull();
});

test('a rejected task cannot be submitted again while a step is unchecked', function () {
    ($this->addSteps)(2, 1);
    $this->task->forceFill(['status' => TaskStatus::EnCours, 'rejection_comment' => 'À reprendre'])->save();

    $this->actingAs($this->assignee)
        ->post(route('tasks.submit', $this->task))
        ->assertForbidden();

    expect($this->task->refresh()->rejection_comment)->toBe('À reprendre');
});

test('a task already in review cannot be submitted twice', function () {
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->assignee)
        ->post(route('tasks.submit', $this->task))
        ->assertForbidden();
});
