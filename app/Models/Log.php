<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'ip',
        'user_agent',
        'action',
        'operated_table',
        'operated_row_id',
        'user_id',
        'previous_data',
        'note'
    ];


	public function getPreviousDataAttribute($data)
	{
        return json_decode($data);
    }

    // protected $casts = [
    //     'previous_data' => 'object'
    // ];
}
