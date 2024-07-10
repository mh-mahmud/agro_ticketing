<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timezone extends Model
{
    use HasFactory;

    protected $fillable = ['timezone','code','utc_offset','utc_dst_offset'];

    public function getCreatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function getUpdatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }
}
