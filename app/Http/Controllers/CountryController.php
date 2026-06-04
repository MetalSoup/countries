<?php

namespace App\Http\Controllers;

use App\Http\Resources\CountryResource;
use App\Models\Country;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index()
    {
        return CountryResource::collection(Country::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required'],
            'code' => ['required'],
            'capital' => ['required'],
        ]);

        return new CountryResource(Country::create($data));
    }

    public function show(Country $country)
    {
        return new CountryResource($country);
    }

    public function update(Request $request, Country $country)
    {
        $data = $request->validate([
            'name' => ['required'],
            'code' => ['required'],
            'capital' => ['required'],
        ]);

        $country->update($data);

        return new CountryResource($country);
    }

    public function destroy(Country $country)
    {
        $country->delete();

        return response()->json();
    }
}
