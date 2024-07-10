<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Source extends Model
{
    use HasFactory;

    protected $fillable = ['id','name','slug','parent_id','created_at','updated_at'];

    public function children()
    {
        return $this->hasMany('App\Models\Source', 'parent_id');
    }

    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function parent()
    {
        return $this->belongsTo('App\Models\Source','parent_id');
    }


    public function parentRecursive()
    {
        return $this->parent()->with('parentRecursive');
    }

    public function getCreatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function getUpdatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }
}
