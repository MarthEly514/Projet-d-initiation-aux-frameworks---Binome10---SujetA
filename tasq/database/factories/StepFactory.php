<?php

namespace Database\Factories;

use App\Models\Step;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;


/**
 * @extends Factory<Step>
 */
class StepFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'task_id' => Task::factory(),
            'title' => fake()->sentence(4),
            'position' => 0,
            'done_at' => null,
        ];
    }
}
