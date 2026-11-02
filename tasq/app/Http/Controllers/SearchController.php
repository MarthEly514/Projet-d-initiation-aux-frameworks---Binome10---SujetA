<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $term = trim($request->string('q')->toString());

        if (mb_strlen($term) < 2) {
            return response()->json(['teams' => [], 'tasks' => []]);
        }

        $like = '%'.addcslashes($term, '%_\\').'%';
        $user = $request->user();

        $teams = $user->teams()
            ->where('teams.name', 'like', $like)
            ->orderBy('teams.name')
            ->limit(5)
            ->get()
            ->map(fn ($team) => ['id' => $team->id, 'name' => $team->name]);

        // Only tasks of teams the user belongs to
        $tasks = Task::whereIn('team_id', $user->teams()->pluck('teams.id'))
            ->where('name', 'like', $like)
            ->with('team:id,name')
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'name' => $task->name,
                'team' => $task->team->name,
                'status' => $task->status->label(),
            ]);

        return response()->json(['teams' => $teams, 'tasks' => $tasks]);
    }
}