<?php

namespace Database\Seeders;

use App\Enums\TaskStatus;
use App\Enums\TeamRole;
use App\Models\Task;
use App\Models\Team;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        [$test, $awa, $koffi, $marie, $yao] = collect([
            ['name' => 'Test User', 'email' => 'test@example.com'],
            ['name' => 'Awa Dossou', 'email' => 'awa@example.com'],
            ['name' => 'Koffi Agbo', 'email' => 'koffi@example.com'],
            ['name' => 'Marie Houssou', 'email' => 'marie@example.com'],
            ['name' => 'Yao Mensah', 'email' => 'yao@example.com'],
        ])->map(fn (array $user) => User::factory()->create($user))->all();

        $this->seedTeam('Équipe Produit', $test, [$awa, $koffi]);
        $this->seedTeam('Équipe Marketing', $marie, [$yao, $test]);
    }

    /**
     * Create a team with one task per status, one overdue task and one without steps.
     *
     * @param  list<User>  $collaborateurs
     */
    private function seedTeam(string $name, User $responsable, array $collaborateurs): void
    {
        $team = Team::factory()->withResponsable($responsable)->create(['name' => $name]);

        foreach ($collaborateurs as $collaborateur) {
            $team->members()->attach($collaborateur, ['role' => TeamRole::Collaborateur->value]);
        }

        $stepsDone = [
            TaskStatus::AFaire->value => 0,
            TaskStatus::EnCours->value => 1,
            TaskStatus::Review->value => 3,
            TaskStatus::Faite->value => 3,
        ];

        foreach (TaskStatus::cases() as $index => $status) {
            $task = Task::factory()->for($team)->status($status)->create();

            $this->assign($task, $collaborateurs[$index % count($collaborateurs)]);
            $this->addSteps($task, $stepsDone[$status->value]);
        }

        $overdue = Task::factory()->for($team)->status(TaskStatus::EnCours)->overdue()->create();

        $this->assign($overdue, $collaborateurs[0]);
        $this->addSteps($overdue, 1);

        $withoutSteps = Task::factory()->for($team)->create();

        $this->assign($withoutSteps, $collaborateurs[0]);
    }

    private function assign(Task $task, User $lead): void
    {
        $task->assignees()->attach($lead, ['is_lead' => true]);
    }

    /**
     * Add three steps to the task, the first ones being done.
     */
    private function addSteps(Task $task, int $done): void
    {
        foreach (range(1, 3) as $position) {
            $task->steps()->create([
                'title' => "Étape {$position}",
                'is_done' => $position <= $done,
                'position' => $position,
            ]);
        }
    }
}
