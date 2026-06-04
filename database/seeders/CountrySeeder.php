<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class CountrySeeder extends Seeder
{
    public function run(): void
    {
        $countries = [];
        try {
            $countries = Http::get('https://restcountries.com/v3.1/all?fields=name,cca2,capital,continents')->json();
        } catch (ConnectionException $e) {

        }

        if (! $countries) {
            return;
        }
        $countries = collect($countries)->map(function ($country) {
            return [
                'name' => $country['name']['common'] ?? null,
                'code' => $country['cca2'] ?? null,
                'capital' => $country['capital'][0] ?? null,
                'continent' => $country['continents'][0] ?? null,
            ];
        })->toArray();



        foreach ($countries as $country) {
            \App\Models\Country::create($country);
        }
    }
}
