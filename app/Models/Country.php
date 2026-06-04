<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'capital',
        'continent',
    ];

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'country_tag', 'country_id', 'tag_id');
    }
}
