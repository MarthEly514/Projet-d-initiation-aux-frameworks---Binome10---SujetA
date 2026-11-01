<?php

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Step;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
use App\Notifications\TaskReadyForReview;
use App\Services\TaskStatusService;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->responsable = User::factory()->create();
    $this->assignee = User::factory()->create();

    $this->team = Team::factory()->withResponsable($this->responsable)->create(['name' => 'Alpha']);
    $this->team->members()->attach($this->assignee, ['role' => TeamRole::Collaborateur->value]);

    $this->task = Task::factory()->for($this->team)->create(['name' => 'Préparer la démo']);
    $this->task->syncAssignees($this->assignee->id);

    $this->notifyResponsable = function (?Task $task = null) {
        $this->responsable->notify(new TaskReadyForReview($task ?? $this->task));

        return $this->responsable->notifications()->first();
    };
});

test('checking the last step notifies the responsables of the team', function () {
    Notification::fake();
    $otherResponsable = User::factory()->create();
    $this->team->members()->attach($otherResponsable, ['role' => TeamRole::Responsable->value]);
    $step = Step::factory()->for($this->task)->create();

    $this->actingAs($this->assignee)->patch(route('steps.toggle', $step));

    Notification::assertSentTo([$this->responsable, $otherResponsable], TaskReadyForReview::class);
    Notification::assertNotSentTo($this->assignee, TaskReadyForReview::class);
});

test('checking a step without finishing the task notifies nobody', function () {
    Notification::fake();
    $steps = Step::factory()->for($this->task)->count(2)->create();

    $this->actingAs($this->assignee)->patch(route('steps.toggle', $steps[0]));

    Notification::assertNothingSent();
});

test('submitting a task without steps notifies the responsable', function () {
    Notification::fake();

    $this->actingAs($this->assignee)->post(route('tasks.submit', $this->task));

    Notification::assertSentTo($this->responsable, TaskReadyForReview::class);
});

test('submitting a rejected task again notifies the responsable', function () {
    Notification::fake();
    $this->task->forceFill(['status' => TaskStatus::EnCours, 'rejection_comment' => 'À reprendre'])->save();

    $this->actingAs($this->assignee)->post(route('tasks.submit', $this->task));

    Notification::assertSentTo($this->responsable, TaskReadyForReview::class);
});

test('a task already in review does not notify twice', function () {
    Notification::fake();
    $step = Step::factory()->for($this->task)->done()->create();
    $this->task->update(['status' => TaskStatus::Review]);

    $this->actingAs($this->responsable)->put(route('steps.update', $step), ['title' => 'Renommée']);
    app(TaskStatusService::class)->recalculate($this->task);

    Notification::assertNothingSent();
});

test('a responsable of another team is not notified', function () {
    Notification::fake();
    $rival = User::factory()->create();
    Team::factory()->withResponsable($rival)->create();

    $this->actingAs($this->assignee)->post(route('tasks.submit', $this->task));

    Notification::assertNotSentTo($rival, TaskReadyForReview::class);
});

test('the notification keeps the task and the team names', function () {
    ($this->notifyResponsable)();

    $this->actingAs($this->responsable)
        ->get(route('my-tasks'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unread', 1)
            ->where('notifications.items.0.task_name', 'Préparer la démo')
            ->where('notifications.items.0.team_name', 'Alpha')
            ->where('notifications.items.0.is_read', false));
});

test('a user only receives their own notifications', function () {
    ($this->notifyResponsable)();

    $this->actingAs($this->assignee)
        ->get(route('my-tasks'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('notifications.unread', 0)
            ->has('notifications.items', 0));
});

test('opening a notification marks it as read and shows the task', function () {
    $notification = ($this->notifyResponsable)();

    $this->actingAs($this->responsable)
        ->post(route('notifications.read', $notification->id))
        ->assertRedirect(route('tasks.show', $this->task));

    expect($notification->refresh()->read())->toBeTrue();
});

test('opening a notification of a deleted task stays on the page', function () {
    $notification = ($this->notifyResponsable)();
    $this->task->delete();

    $this->actingAs($this->responsable)
        ->from(route('my-tasks'))
        ->post(route('notifications.read', $notification->id))
        ->assertRedirect(route('my-tasks'));

    expect($notification->refresh()->read())->toBeTrue();
});

test('opening a notification of a team the user left stays on the page', function () {
    $notification = ($this->notifyResponsable)();
    $this->team->members()->detach($this->responsable);

    $this->actingAs($this->responsable)
        ->from(route('my-tasks'))
        ->post(route('notifications.read', $notification->id))
        ->assertRedirect(route('my-tasks'));
});

test('a user cannot read the notification of someone else', function () {
    $notification = ($this->notifyResponsable)();

    $this->actingAs($this->assignee)
        ->post(route('notifications.read', $notification->id))
        ->assertNotFound();

    expect($notification->refresh()->read())->toBeFalse();
});

test('all the notifications can be marked as read', function () {
    ($this->notifyResponsable)();
    ($this->notifyResponsable)();

    $this->actingAs($this->responsable)
        ->post(route('notifications.read-all'))
        ->assertRedirect();

    expect($this->responsable->unreadNotifications()->count())->toBe(0);
});

test('guests cannot read notifications', function () {
    $this->post(route('notifications.read-all'))->assertRedirect(route('login'));
});
