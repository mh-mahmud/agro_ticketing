<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['id','name','slug','description','parent_id','need_ticket_approval','created_at','updated_at'];

    public function children()
    {
        return $this->hasMany('App\Models\Group', 'parent_id');
    }

    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function parent()
    {
        return $this->belongsTo('App\Models\Group','parent_id');
    }

    public function parentRecursive()
    {
        return $this->parent()->with('parentRecursive');
    }

    // User(Agent) under this group
    public function users() 
    {

        return $this->belongsToMany(User::class, 'groups_agents');

    }

    public function tickets(){
        return $this->hasMany('App\Models\Ticket', 'group_id');
    }
}
