<?php

use App\Http\Controllers\Tasks\MyTaskController;
use App\Http\Controllers\Tasks\StepController;
use App\Http\Controllers\Tasks\TaskController;
use App\Http\Controllers\Tasks\TaskWorkflowController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('my-tasks', MyTaskController::class)->name('my-tasks');

    Route::get('teams/{team}/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('teams/{team}/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    Route::post('tasks/{task}/steps', [StepController::class, 'store'])->name('steps.store');
    Route::put('steps/{step}', [StepController::class, 'update'])->name('steps.update');
    Route::delete('steps/{step}', [StepController::class, 'destroy'])->name('steps.destroy');
    Route::patch('steps/{step}/toggle', [StepController::class, 'toggle'])->name('steps.toggle');

    Route::post('tasks/{task}/submit', [TaskWorkflowController::class, 'submit'])->name('tasks.submit');
    Route::post('tasks/{task}/approve', [TaskWorkflowController::class, 'approve'])->name('tasks.approve');
    Route::post('tasks/{task}/reject', [TaskWorkflowController::class, 'reject'])->name('tasks.reject');
});
