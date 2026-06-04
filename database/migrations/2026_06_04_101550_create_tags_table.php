<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
            // enforce uniqueness at DB level (may be case-insensitive depending on DB collation)
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
    }
};
