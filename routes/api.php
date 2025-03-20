<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('/users', UserController::class);
    Route::apiResource('/clubs', \App\Http\Controllers\Api\ClubController::class);
    
    // Club member management routes
    Route::post('/clubs/{club}/members', [\App\Http\Controllers\Api\ClubMemberController::class, 'store']);
    Route::put('/clubs/{club}/members/{userId}', [\App\Http\Controllers\Api\ClubMemberController::class, 'update']);
    Route::delete('/clubs/{club}/members/{userId}', [\App\Http\Controllers\Api\ClubMemberController::class, 'destroy']);

    // Pending posts routes
    Route::apiResource('/pending-posts', \App\Http\Controllers\Api\PendingPostController::class);
    
    // Published posts routes
    Route::apiResource('/posts', \App\Http\Controllers\Api\PostController::class);
});


Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
