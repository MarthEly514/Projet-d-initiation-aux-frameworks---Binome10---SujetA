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
}
