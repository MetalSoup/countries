<?php

use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Support\Facades\Route;

Route::get('/tags', [TagController::class, 'index']);
Route::post('/tags', [TagController::class, 'store']);
Route::patch('/tags/{tag}', [TagController::class, 'update']);
Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

Route::get('/countries', [CountryController::class, 'index']);
Route::put('/countries/{country}/tags', [CountryController::class, 'syncTags']);
Route::post('/tags/{tag}/countries', [TagController::class, 'attachToCountries']);

