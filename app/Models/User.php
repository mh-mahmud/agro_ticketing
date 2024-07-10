<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Permissions\HasPermissionsTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens,HasPermissionsTrait, HasFactory, Notifiable;
    use SoftDeletes;
    
    public $incrementing = false;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'first_name',
        'middle_name',
        'last_name',
        'slug',
        'username',
        'email',
        'mobile',
        'password',
        'status'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
        'email_verified_at',
    ];
    
    protected $with = ['media','userDetails'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function media()
    {

        return $this->morphOne(Media::class, 'mediable');

    }

    public function userRole()
    {

        return $this->hasMany(UsersRole::class);

    }

    public function apiUser()
    {

        return $this->hasOne(ApiUser::class);

    }

    public function getCreatedAtAttribute($date)
    {

        return date('j M, Y', strtotime($date));

    }

    /**
     * @param $date
     * @return string
     */
    public function getUpdatedAtAttribute($date)
    {

        return date('j M, Y', strtotime($date));

    }

    public function groups() 
    {

        return $this->belongsToMany(Group::class, 'groups_agents');

    }
    
    public function userDetails() 
    {
        
        return $this->hasOne(UserDetail::class, 'id');

    }
}
