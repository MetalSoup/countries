<?php

use App\Models\Country;
use Illuminate\Support\Facades\Route;

Route::get('/', function(){
    $countries = Country::all();
    return inertia('welcome', compact('countries'));
})->name('home');

Route::inertia('countries', 'countries')->name('countries');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
