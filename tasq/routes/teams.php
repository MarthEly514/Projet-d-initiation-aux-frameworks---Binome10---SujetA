<?php

use App\Http\Controllers\OverviewController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\TimelineController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Teams
    Route::get('teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('teams', [TeamController::class, 'store'])->name('teams.store');
    Route::post('teams/join', [TeamController::class, 'join'])->name('teams.join'); // before {team}
    Route::get('teams/{team}', [TeamController::class, 'show'])->name('teams.show');
    Route::put('teams/{team}', [TeamController::class, 'update'])->name('teams.update');
    Route::delete('teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
    Route::post('teams/{team}/leave', [TeamController::class, 'leave'])->name('teams.leave');

    // Members (A2)
    Route::get('teams/{team}/members', [TeamMemberController::class, 'index'])->name('teams.members.index');
    Route::post('teams/{team}/members', [TeamMemberController::class, 'store'])->name('teams.members.store');
    Route::put('teams/{team}/members/{user}', [TeamMemberController::class, 'updateRole'])->name('teams.members.role');
    Route::delete('teams/{team}/members/{user}', [TeamMemberController::class, 'destroy'])->name('teams.members.destroy');

    // Overview (A3) and timeline (A4)
    Route::get('teams/{team}/overview', [OverviewController::class, 'show'])->name('teams.overview');
    Route::get('teams/{team}/timeline', [TimelineController::class, 'show'])->name('teams.timeline');
    
    Route::get('teams/{team}/tasks', fn () => abort(501))->name('teams.tasks.index'); // TEMP: replace with TaskController@index (B1)
});