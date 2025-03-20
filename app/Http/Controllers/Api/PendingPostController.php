<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePendingPostRequest;
use App\Http\Resources\PendingPostResource;
use App\Models\PendingPost;
use App\Models\PostImage;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PendingPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $pendingPosts = PendingPost::with(['club', 'user'])
            ->where('status', 'pending')  // Only get posts with pending status
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return PendingPostResource::collection($pendingPosts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePendingPostRequest $request)
    {
        // Create the pending post
        $pendingPost = PendingPost::create([
            'club_id' => $request->club_id,
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'content' => $request->content,
            'status' => 'pending'
        ]);

        // Process images in the content
        $content = $request->content;
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true); // Suppress HTML5 errors
        $dom->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        
        $images = $dom->getElementsByTagName('img');
        
        foreach ($images as $img) {
            $src = $img->getAttribute('src');
            
            // Check if the image is base64 encoded
            if (strpos($src, 'data:image/') === 0) {
                // Extract the image data
                $imageData = base64_decode(explode(',', $src)[1]);
                
                // Generate a unique filename
                $filename = uniqid('post_') . '.jpg';
                
                // Store the image
                Storage::disk('public')->put('post-images/' . $filename, $imageData);
                
                // Create image record
                PostImage::create([
                    'pending_post_id' => $pendingPost->id,
                    'path' => 'post-images/' . $filename
                ]);
                
                // Update the src in the content with the full URL
                $fullUrl = url(Storage::url('post-images/' . $filename));
                $img->setAttribute('src', $fullUrl);
            }
        }
        
        // Update the post content with the new image URLs
        $pendingPost->update([
            'content' => $dom->saveHTML()
        ]);

        return new PendingPostResource($pendingPost);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PendingPost $pendingPost)
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|nullable|string'
        ]);

        $pendingPost->update($validated);

        // If post is approved, create a published post
        if ($validated['status'] === 'approved') {
            // Create new post in the posts table
            $post = Post::create([
                'club_id' => $pendingPost->club_id,
                'user_id' => $pendingPost->user_id,
                'title' => $pendingPost->title,
                'content' => $pendingPost->content,
                'published_at' => now(),
            ]);

            // Update the post_images to link to the new post
            $images = PostImage::where('pending_post_id', $pendingPost->id)->get();
            foreach ($images as $image) {
                $image->update([
                    'post_id' => $post->id
                ]);
            }
        }

        return new PendingPostResource($pendingPost);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pendingPost = PendingPost::findOrFail($id);
        
        // Check if post exists and has pending status
        if ($pendingPost->status !== 'pending') {
            return response()->json([
                'message' => 'Only pending posts can be discarded'
            ], 403);
        }
        
        // Delete related images from storage if they exist
        $images = PostImage::where('pending_post_id', $id)->get();
        foreach ($images as $image) {
            if (Storage::disk('public')->exists($image->path)) {
                Storage::disk('public')->delete($image->path);
            }
            $image->delete();
        }
        
        // Delete the post
        $pendingPost->delete();
        
        return response()->json([
            'message' => 'Post discarded successfully'
        ]);
    }
}
