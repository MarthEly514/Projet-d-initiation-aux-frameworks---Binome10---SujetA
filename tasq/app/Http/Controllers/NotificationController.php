<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Mark a notification as read and open its task when it can still be seen.
     */
    public function read(Request $request, string $notification): RedirectResponse
    {
        $user = $request->user();
        $notification = $user->notifications()->findOrFail($notification);

        $notification->markAsRead();

        $task = Task::find($notification->data['task_id']);

        return $task && $user->can('view', $task) ? to_route('tasks.show', $task) : back();
    }

    /**
     * Mark all the notifications of the user as read.
     */
    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return back();
    }
}
