<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'capacity',
        'location',
        'is_available'
    ];

    /**
     * Get the bookings for this room
     */
    public function bookings()
    {
        return $this->hasMany(RoomBooking::class);
    }
}
