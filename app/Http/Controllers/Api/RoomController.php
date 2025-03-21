<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Models\RoomBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RoomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rooms = Room::orderBy('name', 'asc')->paginate(10);
        return RoomResource::collection($rooms);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:255',
            'is_available' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room = Room::create($request->all());
        return new RoomResource($room);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $room = Room::findOrFail($id);
        return new RoomResource($room);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $room = Room::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'capacity' => 'nullable|integer|min:1',
            'location' => 'nullable|string|max:255',
            'is_available' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $room->update($request->all());
        return new RoomResource($room);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $room = Room::findOrFail($id);
        $room->delete();
        
        return response()->json(['message' => 'Room deleted successfully']);
    }
    
    /**
     * Get bookings for a specific room on a specific date
     */
    public function getBookings(Request $request, string $roomId)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $date = $request->date;
        $user = $request->user();
        
        // Make sure the room exists
        $room = Room::findOrFail($roomId);
        
        // Get all bookings for this room on the specified date
        $query = RoomBooking::where('room_id', $roomId)
            ->whereDate('start_time', $date)
            ->where('status', 'approved')
            ->orderBy('start_time', 'asc')
            ->with('club');
            
        // Filter to only show public bookings or bookings for user's clubs
        $query->where(function($q) use ($user) {
            $q->where('visibility', 'public');
            
            // Add club-only bookings if user is authenticated
            if ($user) {
                // Get list of club IDs the user belongs to
                $userClubIds = $user->clubs()->pluck('clubs.id')->toArray();
                
                // Include club-only bookings for clubs the user belongs to
                if (!empty($userClubIds)) {
                    $q->orWhere(function($subQ) use ($userClubIds) {
                        $subQ->where('visibility', 'club_only')
                             ->whereIn('club_id', $userClubIds);
                    });
                }
            }
        });
        
        $bookings = $query->get()
            ->map(function($booking) {
                return [
                    'id' => $booking->id,
                    'start_time' => $booking->start_time,
                    'end_time' => $booking->end_time,
                    'club_name' => $booking->club->name ?? 'N/A',
                    'description' => $booking->roomdescription,
                    'visibility' => $booking->visibility,
                ];
            });
            
        return response()->json([
            'bookings' => $bookings,
            'room' => new RoomResource($room),
        ]);
    }
}
