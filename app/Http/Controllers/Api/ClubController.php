<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClubRequest;
use App\Http\Requests\UpdateClubRequest;
use App\Http\Resources\ClubResource;
use App\Models\Club;
use Illuminate\Http\Request;

class ClubController extends Controller
{
    /**
     * Display a listing of clubs.
     */
    public function index(Request $request)
    {
        $query = Club::query();
        
        // Include members if requested
        if ($request->has('with_members')) {
            $query->with('members');
        }

        $clubs = $query->orderBy('id', 'desc')->paginate(10);
        return ClubResource::collection($clubs);
    }

    /**
     * Store a newly created club.
     */
    public function store(StoreClubRequest $request)
    {
        $club = Club::create($request->validated());
        return new ClubResource($club);
    }

    /**
     * Display the specified club.
     */
    public function show(Request $request, Club $club)
    {
        if ($request->has('with_members')) {
            $club->load('members');
        }
        return new ClubResource($club);
    }

    /**
     * Update the specified club.
     */
    public function update(UpdateClubRequest $request, Club $club)
    {
        $club->update($request->validated());
        return new ClubResource($club);
    }

    /**
     * Remove the specified club.
     */
    public function destroy(Club $club)
    {
        $club->delete();
        return response()->noContent();
    }
}
