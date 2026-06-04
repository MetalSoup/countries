<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('continent');
            $table->string('code');
            $table->string('capital')->nullable();
            $table->timestamps();
            $table->index(['name']);
            $table->index(['code']);
            $table->index(['capital']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
