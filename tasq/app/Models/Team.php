<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Team extends Model
{
    /** @use HasFactory<\Database\Factories\TeamFactory> */
    use HasFactory;

    protected $fillable = ['name', 'invite_code'];

    protected static function booted():void
    {
        static::creating(function (Team $team)
            {
                if (empty($team->invite_code)) {
                    do {
                        $code = Str::upper(Str::random(8));
                    } while (static::where('invite_code', $code)->exists());

                    $team->invite_code = $code;
                }
            }
        );

    }
}
