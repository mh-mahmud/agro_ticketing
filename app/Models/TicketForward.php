<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketForward extends Model
{
    use HasFactory;
    protected $fillable =
    [
        'id',
        'ticket_id',
        'group_id',
        'agent_id',
       
    ];
    
public function agent_user(){
    return $this->belongsTo(User::class,'agent_id','id');
}

public function ticket(){
    return $this->belongsTo(Ticket::class,'ticket_id','id');
}

public function group(){
    return $this->belongsTo(Group::class,'group_id','id');
}

public function getCreatedAtAttribute($date)
{
    return date('j M, Y h:i:s', strtotime($date));
}

public function getUpdatedAtAttribute($date)
{
    return date('j M, Y', strtotime($date));
}


}
