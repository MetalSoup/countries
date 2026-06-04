<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CountryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Build a query and perform filtering/sorting in the database for
        // better performance and to support ordering by tag counts.
        $q = Country::with('tags');

        // case-insensitive search across name, continent and capital
        if ($search = $request->query('search')) {
            $term = mb_strtolower($search);
            $q->where(function ($sub) use ($term) {
                $sub->whereRaw('LOWER(name) LIKE ?', ["%{$term}%"])
                    ->orWhereRaw('LOWER(continent) LIKE ?', ["%{$term}%"])
                    ->orWhereRaw('LOWER(capital) LIKE ?', ["%{$term}%"]);
            });
        }

        // tag filtering: tag_ids[]=1&tag_ids[]=2 and mode=and|or
        $tagIds = $request->query('tag_ids', []);
        $mode = $request->query('mode', 'or');

        if (!empty($tagIds)) {
            $tagIds = array_filter(array_map('intval', (array) $tagIds));
            if ($mode === 'and') {
                foreach ($tagIds as $tagId) {
                    $q->whereHas('tags', function ($sub) use ($tagId) {
                        $sub->where('tags.id', $tagId);
                    });
                }
            } else {
                $q->whereHas('tags', function ($sub) use ($tagIds) {
                    $sub->whereIn('tags.id', $tagIds);
                });
            }
        }

        // Sorting: support sort_by=name|capital|continent|tags and sort_dir=asc|desc
        $sortBy = $request->query('sort_by', 'name');
        $sortDir = strtolower($request->query('sort_dir', 'asc')) === 'desc' ? 'desc' : 'asc';

        if (in_array($sortBy, ['tags', 'tags_count'])) {
            $q->withCount('tags')->orderBy('tags_count', $sortDir);
        } elseif (in_array($sortBy, ['name', 'capital', 'continent'])) {
            $q->orderBy($sortBy, $sortDir);
        } else {
            $q->orderBy('name', 'asc');
        }

        $countries = $q->get();

        return response()->json(['data' => $countries]);
    }

    // sync tags for a country (replace existing set)
    public function syncTags(Request $request, Country $country): JsonResponse
    {
        $request->validate([
            'tag_ids' => ['array'],
            'tag_ids.*' => ['integer', 'exists:tags,id'],
        ]);

        $tagIds = array_values($request->input('tag_ids', []));
        $country->tags()->sync($tagIds);

        $country->load('tags');
        return response()->json(['data' => $country]);
    }
}

