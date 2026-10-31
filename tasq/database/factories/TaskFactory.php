<?php

namespace Database\Factories;

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
        $start = fake()->dateTimeBetween('-1 week', '+1 week');

        return [
            'team_id' => Team::factory(),
            'name' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'status' => fake()->randomElement(['a_faire', 'en_cours', 'review', 'faite']),
            'start_date' => $start,
            'end_date' => (clone $start)->modify('+' . fake()->numberBetween(2, 14) . ' days'),
        ];
    }
}
