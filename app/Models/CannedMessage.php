<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CannedMessage extends Model
{
    use HasFactory;

    protected $fillable = ['id','title','slug','description','created_at','updated_at'];

    public function getCreatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function getUpdatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }
}
