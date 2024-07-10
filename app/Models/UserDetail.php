<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Permissions\HasPermissionsTrait;

class UserDetail extends Model
{
    use HasFactory, SoftDeletes, HasPermissionsTrait;

    public function media()
    {

        return $this->morphOne(Media::class, 'mediable');

    }
    
    public function groups() 
    {

        return $this->belongsToMany(Group::class, 'groups_agents','user_id');

    }
}
