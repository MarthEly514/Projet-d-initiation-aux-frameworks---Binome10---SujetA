<?php

namespace App\Enums;

enum TeamRole: string
{
    case Responsable = 'responsable';
    case Collaborateur = 'collaborateur';

    public function label(): string
    {
        return match ($this) {
            self::Responsable => 'Responsable',
            self::Collaborateur => 'Collaborateur',
        };
    }
}
