<?php
//php artisan test tests/Feature/CountryFilterTest.php
use App\Models\Country;
use App\Models\Tag;

it('returns all countries with no filters', function () {
    Country::factory()->count(3)->create();

    $response = $this->getJson('/api/countries');

    $response->assertOk()
        ->assertJsonCount(3, 'data');
});

it('filters by name search', function () {
    Country::factory()->create(['name' => 'Germany', 'capital' => 'Berlin', 'continent' => 'Europe']);
    Country::factory()->create(['name' => 'France', 'capital' => 'Paris', 'continent' => 'Europe']);

    $response = $this->getJson('/api/countries?search=germ');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Germany');
});

it('filters by capital search', function () {
    Country::factory()->create(['name' => 'Germany', 'capital' => 'Berlin', 'continent' => 'Europe']);
    Country::factory()->create(['name' => 'France', 'capital' => 'Paris', 'continent' => 'Europe']);

    $response = $this->getJson('/api/countries?search=paris');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'France');
});

it('filters by continent search', function () {
    Country::factory()->create(['name' => 'Germany', 'capital' => 'Berlin', 'continent' => 'Europe']);
    Country::factory()->create(['name' => 'Japan', 'capital' => 'Tokyo', 'continent' => 'Asia']);

    $response = $this->getJson('/api/countries?search=asia');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Japan');
});

it('filters by tag ids with or mode', function () {
    $tagA = Tag::factory()->create(['name' => 'coastal']);
    $tagB = Tag::factory()->create(['name' => 'landlocked']);

    $germany = Country::factory()->create(['name' => 'Germany', 'capital' => 'Berlin', 'continent' => 'Europe']);
    $france  = Country::factory()->create(['name' => 'France', 'capital' => 'Paris', 'continent' => 'Europe']);
    $japan   = Country::factory()->create(['name' => 'Japan', 'capital' => 'Tokyo', 'continent' => 'Asia']);

    $germany->tags()->attach($tagA);
    $france->tags()->attach($tagB);

    $response = $this->getJson("/api/countries?tag_ids[]={$tagA->id}&tag_ids[]={$tagB->id}&mode=or");

    $response->assertOk()
        ->assertJsonCount(2, 'data');

    $names = collect($response->json('data'))->pluck('name')->sort()->values()->all();
    expect($names)->toBe(['France', 'Germany']);
});

it('filters by tag ids with and mode', function () {
    $tagA = Tag::factory()->create(['name' => 'coastal']);
    $tagB = Tag::factory()->create(['name' => 'mountainous']);

    $germany = Country::factory()->create(['name' => 'Germany', 'capital' => 'Berlin', 'continent' => 'Europe']);
    $france  = Country::factory()->create(['name' => 'France', 'capital' => 'Paris', 'continent' => 'Europe']);

    $germany->tags()->attach([$tagA->id, $tagB->id]);
    $france->tags()->attach($tagA);

    $response = $this->getJson("/api/countries?tag_ids[]={$tagA->id}&tag_ids[]={$tagB->id}&mode=and");

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'Germany');
});

it('returns no results when no countries match the and filter', function () {
    $tagA = Tag::factory()->create(['name' => 'coastal']);
    $tagB = Tag::factory()->create(['name' => 'mountainous']);

    $country = Country::factory()->create(['name' => 'Germany', 'capital' => 'Berlin', 'continent' => 'Europe']);
    $country->tags()->attach($tagA);

    $response = $this->getJson("/api/countries?tag_ids[]={$tagA->id}&tag_ids[]={$tagB->id}&mode=and");

    $response->assertOk()
        ->assertJsonCount(0, 'data');
});

it('sorts by name ascending', function () {
    Country::factory()->create(['name' => 'Zimbabwe', 'capital' => 'Harare', 'continent' => 'Africa']);
    Country::factory()->create(['name' => 'Albania', 'capital' => 'Tirana', 'continent' => 'Europe']);

    $response = $this->getJson('/api/countries?sort_by=name&sort_dir=asc');

    $response->assertOk();
    $names = collect($response->json('data'))->pluck('name')->all();
    expect($names[0])->toBe('Albania');
    expect($names[1])->toBe('Zimbabwe');
});

it('sorts by name descending', function () {
    Country::factory()->create(['name' => 'Albania', 'capital' => 'Tirana', 'continent' => 'Europe']);
    Country::factory()->create(['name' => 'Zimbabwe', 'capital' => 'Harare', 'continent' => 'Africa']);

    $response = $this->getJson('/api/countries?sort_by=name&sort_dir=desc');

    $response->assertOk();
    $names = collect($response->json('data'))->pluck('name')->all();
    expect($names[0])->toBe('Zimbabwe');
    expect($names[1])->toBe('Albania');
});

it('sorts by tag count descending', function () {
    $tagA = Tag::factory()->create();
    $tagB = Tag::factory()->create();

    $few  = Country::factory()->create(['name' => 'Albania', 'capital' => 'Tirana', 'continent' => 'Europe']);
    $many = Country::factory()->create(['name' => 'Germany', 'capital' => 'Berlin', 'continent' => 'Europe']);

    $few->tags()->attach($tagA);
    $many->tags()->attach([$tagA->id, $tagB->id]);

    $response = $this->getJson('/api/countries?sort_by=tags&sort_dir=desc');

    $response->assertOk();
    $names = collect($response->json('data'))->pluck('name')->all();
    expect($names[0])->toBe('Germany');
    expect($names[1])->toBe('Albania');
});

it('returns tags nested in each country', function () {
    $tag     = Tag::factory()->create(['name' => 'island']);
    $country = Country::factory()->create(['name' => 'Japan', 'capital' => 'Tokyo', 'continent' => 'Asia']);
    $country->tags()->attach($tag);

    $response = $this->getJson('/api/countries');

    $response->assertOk()
        ->assertJsonPath('data.0.tags.0.name', 'island');
});
