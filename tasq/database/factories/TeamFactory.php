<?php

namespace Database\Factories;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
        ];
    }

    /**
     * Attach the given user to the team as responsable.
     */
    public function withResponsable(?User $user = null): static
    {
        return $this->afterCreating(function (Team $team) use ($user): void {
            $team->members()->attach($user ?? User::factory()->create(), [
                'role' => TeamRole::Responsable->value,
            ]);
        });
    }
}
