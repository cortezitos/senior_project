<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'pending_post_id',
        'path'
    ];

    public function pendingPost()
    {
        return $this->belongsTo(PendingPost::class);
    }
}
