<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tag;

class TagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'Welcoming',
            'Reserved',
            'Traditional',
            'Modern',
            'Diverse',
            'Nightlife',
            'Affordable',
            'Luxury',
            'Bargain Shopping',
            'Pricey Accommodation', 'Cheap Eats',
            'Expensive Dining',
            'Street Food Heaven',
            'Gourmet Cuisine',
            'Wine Country',
            'Coffee Culture',
            'Cheap Beer',
            'Expensive Beer',
            'Craft Spirits',
            'Difficult Visa',
            'Good Infrastructure',
            'Poor Infrastructure',
            'Reliable Transport',
            'Relaxed',
            'Busy',
            'Romantic',
            'Adventurous',
            'Spiritual',
            'Historic',
            'Futuristic',
        ];

        foreach ($tags as $name) {
            Tag::firstOrCreate(['name' => strtolower($name)]);
        }

        $allTags = Tag::pluck('id')->toArray();
        $countries = \App\Models\Country::all();

        foreach ($countries as $country) {
            $count = rand(0, 5);
            if ($count > 0) {
                $country->tags()->sync(array_slice(
                    collect($allTags)->shuffle()->toArray(),
                    0,
                    $count
                ));
            }
        }
    }
}

