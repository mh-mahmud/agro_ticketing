<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Type extends Model
{
    use HasFactory;

    use HasFactory;

    protected $fillable = ['id','name','slug','details','day','hour','min','created_at','updated_at'];

    public function getCreatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function getUpdatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function parent()
    {
        return $this->belongsTo('App\Models\Type','parent_id');
    }
}
