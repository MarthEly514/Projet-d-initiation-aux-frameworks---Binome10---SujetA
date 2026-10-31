<?php

namespace App\Enums;

enum TaskStatus: string
{
    case AFaire = 'a_faire';
    case EnCours = 'en_cours';
    case Review = 'review';
    case Faite = 'faite';

    public function label(): string
    {
        return match ($this) {
            self::AFaire => 'À faire',
            self::EnCours => 'En cours',
            self::Review => 'En review',
            self::Faite => 'Faite',
        };
    }

    /**
     * The statuses as options for the filters.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $status) => ['value' => $status->value, 'label' => $status->label()],
            self::cases(),
        );
    }
}
