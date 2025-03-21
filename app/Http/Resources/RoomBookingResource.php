<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomBookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'room_id' => $this->room_id,
            'roomname' => $this->roomname,
            'roomdescription' => $this->roomdescription,
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'club' => $this->whenLoaded('club', function() {
                return [
                    'id' => $this->club->id,
                    'name' => $this->club->name,
                ];
            }),
            'room' => $this->whenLoaded('room', function() {
                return [
                    'id' => $this->room->id,
                    'name' => $this->room->name,
                    'location' => $this->room->location,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
