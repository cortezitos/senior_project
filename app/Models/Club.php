<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Club extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'logo_url',
    ];

    /**
     * Get all members of the club
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'club_members')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get club membership records
     */
    public function clubMembers()
    {
        return $this->hasMany(ClubMember::class);
    }
}
