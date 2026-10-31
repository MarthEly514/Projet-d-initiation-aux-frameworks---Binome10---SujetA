<?php

namespace App\Enums;

/**
 * Événements d'une tâche, émis par la feature Tâches et lus par la timeline.
 */
enum TaskEvent: string
{
    case Created = 'created';
    case Updated = 'updated';
    case Assigned = 'assigned';
    case StatusChanged = 'status_changed';
    case Deleted = 'deleted';

    public function label(): string
    {
        return match ($this) {
            self::Created => 'Tâche créée',
            self::Updated => 'Tâche modifiée',
            self::Assigned => 'Tâche assignée',
            self::StatusChanged => 'Statut changé',
            self::Deleted => 'Tâche supprimée',
        };
    }
}
