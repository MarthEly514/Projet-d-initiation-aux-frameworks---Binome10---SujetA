<?php

namespace Database\Factories;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'status' => TaskStatus::AFaire,
            'start_date' => now(),
            'end_date' => now()->addWeek(),
        ];
    }

    /**
     * Set the status of the task.
     */
    public function status(TaskStatus $status): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => $status,
        ]);
    }

    /**
     * Indicate that the due date of the task has passed.
     */
    public function overdue(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => now()->subWeeks(2),
            'end_date' => now()->subDays(3),
        ]);
    }
}
