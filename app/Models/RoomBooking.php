<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'roomname',
        'roomdescription',
        'start_time',
        'end_time',
        'status',
        'visibility',
        'club_id'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    /**
     * Get the room associated with this booking
     */
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the club that made this booking
     */
    public function club()
    {
        return $this->belongsTo(Club::class);
    }
}
