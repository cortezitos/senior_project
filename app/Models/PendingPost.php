<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PendingPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'club_id',
        'user_id',
        'title',
        'content',
        'status',
        'rejection_reason'
    ];

    /**
     * Get the club that the post belongs to
     */
    public function club()
    {
        return $this->belongsTo(Club::class);
    }

    /**
     * Get the user who created the post
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the images associated with the post
     */
    public function images()
    {
        return $this->hasMany(PostImage::class);
    }
} 