<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = ['id','ticket_id','note','seen'];

    public function ticket(){
        return $this->belongsTo(Ticket::class,'ticket_id','id');
    }

    public function getCreatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function getUpdatedAtAttribute($date)
    {
        return date('j M, Y', strtotime($date));
    }

    public function notificationUsers(){
        return $this->hasMany(NotificationUser::class, 'notification_id');
    }
}
