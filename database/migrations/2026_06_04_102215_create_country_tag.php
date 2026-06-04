<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('country_tag', function (Blueprint $table) {
            $table->foreignId('country_id');
            $table->foreignId('tag_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('country_tag');
    }
};
