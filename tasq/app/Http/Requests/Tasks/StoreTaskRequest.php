<?php

namespace App\Http\Requests\Tasks;

use App\Enums\TaskStatus;
use App\Models\Task;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', [Task::class, $this->route('team')]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::enum(TaskStatus::class)],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'lead_id' => ['required', 'integer', $this->memberOfTeam()],
            'collaborator_ids' => ['array'],
            'collaborator_ids.*' => ['integer', $this->memberOfTeam()],
        ];
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Donnez un nom à la tâche.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'description.max' => 'La description ne doit pas dépasser 5000 caractères.',
            'status.required' => 'Choisissez un statut.',
            'status.enum' => 'Ce statut n’existe pas.',
            'start_date.date' => 'Cette date n’est pas valide.',
            'end_date.date' => 'Cette date n’est pas valide.',
            'end_date.after_or_equal' => 'L’échéance ne peut pas précéder la date de début.',
            'lead_id.required' => 'Choisissez un responsable.',
            'lead_id.exists' => 'Le responsable doit être membre de l’équipe.',
            'collaborator_ids.*.exists' => 'Les collaborateurs doivent être membres de l’équipe.',
        ];
    }

    /**
     * The team the task belongs to.
     */
    protected function team(): Team
    {
        return $this->route('team');
    }

    private function memberOfTeam(): Exists
    {
        return Rule::exists('team_user', 'user_id')->where('team_id', $this->team()->id);
    }
}
