<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessHour extends Model
{
    use HasFactory;

    protected $fillable = ['id','name','slug','description','time_zone_id','holi_day_id','status'];


    public function timeSlots()
    {

        return $this->hasMany(TimeSlot::class,'business_hour_id','id');

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
}
