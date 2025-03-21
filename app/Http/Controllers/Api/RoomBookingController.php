<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\RoomBookingResource;
use App\Models\Room;
use App\Models\RoomBooking;
use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RoomBookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = RoomBooking::with(['club', 'room']);
        
        // Filter by club if specified
        if ($request->filled('club_id')) {
            $query->where('club_id', $request->club_id);
        }
        
        // Filter by room if specified
        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }
        
        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('start_time', '>=', $request->start_date);
        }
        
        if ($request->filled('end_date')) {
            $query->whereDate('end_time', '<=', $request->end_date);
        }
        
        // Filter by visibility
        if ($request->filled('visibility')) {
            $query->where('visibility', $request->visibility);
        }
        
        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10);
        return RoomBookingResource::collection($bookings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'room_id' => 'required|exists:rooms,id',
            'club_id' => 'required|exists:clubs,id',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
            'roomdescription' => 'required|string',
            'visibility' => 'required|in:public,club_only',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if the user is a president of the club
        $club = Club::findOrFail($request->club_id);
        $userClub = $club->members()->where('user_id', $request->user()->id)->first();
        
        if (!$userClub || $userClub->pivot->role !== 'president') {
            return response()->json([
                'message' => 'Only club presidents can book rooms for their club'
            ], 403);
        }

        // Check if the room is available during the requested time
        $room = Room::findOrFail($request->room_id);
        
        if (!$room->is_available) {
            return response()->json([
                'message' => 'This room is not available for booking'
            ], 422);
        }

        // Check for overlapping bookings
        $overlappingBookings = RoomBooking::where('room_id', $request->room_id)
            ->where('status', 'approved')
            ->where(function($query) use ($request) {
                $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                    ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                    ->orWhere(function($query) use ($request) {
                        $query->where('start_time', '<=', $request->start_time)
                            ->where('end_time', '>=', $request->end_time);
                    });
            })
            ->count();

        if ($overlappingBookings > 0) {
            return response()->json([
                'message' => 'The room is already booked for this time period'
            ], 422);
        }

        // Create the booking
        $booking = RoomBooking::create([
            'room_id' => $request->room_id,
            'roomname' => $room->name,
            'roomdescription' => $request->roomdescription,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'status' => 'pending',
            'visibility' => $request->visibility,
            'club_id' => $request->club_id
        ]);

        return new RoomBookingResource($booking->load(['club', 'room']));
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $booking = RoomBooking::with(['club', 'room'])->findOrFail($id);
        return new RoomBookingResource($booking);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $booking = RoomBooking::findOrFail($id);
        
        $validator = Validator::make($request->all(), [
            'start_time' => 'sometimes|required|date|after:now',
            'end_time' => 'sometimes|required|date|after:start_time',
            'roomdescription' => 'sometimes|required|string',
            'visibility' => 'sometimes|required|in:public,club_only',
            'status' => 'sometimes|required|in:pending,approved,rejected'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Only admins can update status
        if ($request->has('status') && $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Only administrators can update booking status'
            ], 403);
        }

        // Check if this is the user's club booking
        $club = Club::findOrFail($booking->club_id);
        $userClub = $club->members()->where('user_id', $request->user()->id)->first();
        
        if (!$userClub || $userClub->pivot->role !== 'president') {
            if ($request->user()->role !== 'admin') {
                return response()->json([
                    'message' => 'You can only update bookings for your own club'
                ], 403);
            }
        }

        // If changing times, check for overlapping bookings
        if (($request->has('start_time') || $request->has('end_time')) && $booking->status === 'approved') {
            $start_time = $request->start_time ?? $booking->start_time;
            $end_time = $request->end_time ?? $booking->end_time;
            
            $overlappingBookings = RoomBooking::where('room_id', $booking->room_id)
                ->where('id', '!=', $booking->id)
                ->where('status', 'approved')
                ->where(function($query) use ($start_time, $end_time) {
                    $query->whereBetween('start_time', [$start_time, $end_time])
                        ->orWhereBetween('end_time', [$start_time, $end_time])
                        ->orWhere(function($query) use ($start_time, $end_time) {
                            $query->where('start_time', '<=', $start_time)
                                ->where('end_time', '>=', $end_time);
                        });
                })
                ->count();

            if ($overlappingBookings > 0) {
                return response()->json([
                    'message' => 'The room is already booked for this time period'
                ], 422);
            }
        }

        // Update the booking
        $booking->update($request->all());
        
        return new RoomBookingResource($booking->load(['club', 'room']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $booking = RoomBooking::findOrFail($id);
        
        // Check if this is the user's club booking
        $club = Club::findOrFail($booking->club_id);
        $userClub = $club->members()->where('user_id', $request->user()->id)->first();
        
        if (!$userClub || $userClub->pivot->role !== 'president') {
            if ($request->user()->role !== 'admin') {
                return response()->json([
                    'message' => 'You can only delete bookings for your own club'
                ], 403);
            }
        }
        
        $booking->delete();
        
        return response()->json([
            'message' => 'Booking deleted successfully'
        ]);
    }
    
    /**
     * Get bookings for a club
     */
    public function getClubBookings(Request $request, string $clubId)
    {
        $club = Club::findOrFail($clubId);
        
        // Check if user belongs to this club or is admin
        if ($request->user()->role !== 'admin') {
            $userClub = $club->members()->where('user_id', $request->user()->id)->first();
            if (!$userClub) {
                return response()->json([
                    'message' => 'You do not have permission to view these bookings'
                ], 403);
            }
        }
        
        $bookings = RoomBooking::where('club_id', $clubId)
            ->with(['room'])
            ->orderBy('start_time', 'desc')
            ->paginate(10);
            
        return RoomBookingResource::collection($bookings);
    }
}
