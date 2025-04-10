<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;


class UserResource extends JsonResource
{
    public static $wrap = false;
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'year_of_study' => $this->year_of_study,
            'major' => $this->major,
            'school' => $this->school,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
