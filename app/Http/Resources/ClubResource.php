<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClubResource extends JsonResource
{
    public static $wrap = false;
    
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'logo_url' => $this->logo_url,
            'members_count' => $this->members()->count(),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            // Include members data if it's loaded
            'members' => $this->when($this->relationLoaded('members'), function () {
                return $this->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'role' => $member->pivot->role,
                        'joined_at' => $member->pivot->joined_at,
                    ];
                });
            }),
        ];
    }
}
