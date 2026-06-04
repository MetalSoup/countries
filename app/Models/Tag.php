<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function countries(): BelongsToMany
    {
        return $this->belongsToMany(Country::class, 'country_tag', 'tag_id', 'country_id');
    }
}
