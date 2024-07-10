<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $with = ['user', 'media'];

    protected $fillable =
    [
        'id',
        'ticket_id',
        'message',
        'created_at',
        'updated_at'
    ];

    public function ticket(){
        return $this->belongsTo(Ticket::class,'ticket_id','id');
    }

    public function getCreatedAtAttribute($date)
    {
        return date('d-M-Y h:i:s A', strtotime($date));
    }

    public function getUpdatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function user(){
        return $this->belongsTo(User::class, 'replied_by', 'id');
    }

    public function media(){
        return $this->morphOne(Media::class, 'mediable');
    }
  
}
