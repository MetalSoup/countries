<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    public function index(): JsonResponse
    {
        // Include a count of related countries so the UI can display how many
        // countries are attached to each tag and update counts in real time.
        $tags = Tag::withCount('countries')->orderBy('name')->get();
        return response()->json(['data' => $tags]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $name = trim($request->input('name'));
        // Tag model normalizes to lowercase on set, so check normalized value
        $normalized = mb_strtolower($name);
        if (Tag::where('name', $normalized)->exists()) {
            return response()->json(['message' => 'Tag name already exists'], 422);
        }

        $tag = Tag::create(['name' => $name]);

        return response()->json(['data' => $tag], 201);
    }

    public function update(Request $request, Tag $tag): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $name = trim($request->input('name'));
        $normalized = mb_strtolower($name);
        if (Tag::where('name', $normalized)->where('id', '!=', $tag->id)->exists()) {
            return response()->json(['message' => 'Tag name already exists'], 422);
        }

        $tag->update(['name' => $name]);

        return response()->json(['data' => $tag]);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        // detach via cascade on pivot (migration) but ensure detach for safety
        $tag->countries()->detach();
        $tag->delete();

        return response()->json([], 204);
    }

    /**
     * Attach this tag to multiple countries in one request.
     * Expects: { country_ids: [1,2,3] }
     */
    public function attachToCountries(Request $request, Tag $tag): JsonResponse
    {
        $request->validate([
            'country_ids' => ['required', 'array'],
            'country_ids.*' => ['integer', 'exists:countries,id'],
        ]);

        $ids = array_values(array_unique(array_map('intval', $request->input('country_ids', []))));

        // Use syncWithoutDetaching to attach the tag to the provided countries
        // without removing existing attachments.
        $tag->countries()->syncWithoutDetaching($ids);

        // Return the tag with updated count
        $tag->loadCount('countries');

        return response()->json(['data' => $tag]);
    }
}


