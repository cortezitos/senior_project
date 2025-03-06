<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClubMemberRequest;
use App\Models\Club;
use App\Models\ClubMember;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ClubMemberController extends Controller
{
    /**
     * Add a member to the club
     */
    public function store(ClubMemberRequest $request, Club $club)
    {
        // Check if user is already a member
        $exists = $club->members()->where('user_id', $request->user_id)->exists();
        if ($exists) {
            return response()->json([
                'message' => 'User is already a member of this club'
            ], 422);
        }

        $club->members()->attach($request->user_id, [
            'role' => $request->role,
            'joined_at' => now()
        ]);

        return response()->noContent();
    }

    /**
     * Update member's role
     */
    public function update(ClubMemberRequest $request, Club $club, $userId)
    {
        $member = $club->clubMembers()->where('user_id', $userId)->first();
        
        if (!$member) {
            return response()->json([
                'message' => 'User is not a member of this club'
            ], 404);
        }

        $club->members()->updateExistingPivot($userId, [
            'role' => $request->role
        ]);

        return response()->noContent();
    }

    /**
     * Remove member from club
     */
    public function destroy(Club $club, $userId)
    {
        $member = $club->clubMembers()->where('user_id', $userId)->first();
        
        if (!$member) {
            return response()->json([
                'message' => 'User is not a member of this club'
            ], 404);
        }

        $club->members()->detach($userId);

        return response()->noContent();
    }
}
