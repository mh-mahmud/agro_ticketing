<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Services\SlaService;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'subject',
        'contact_id',
        'type_id',
        'status_id',
        'priority_id',
        'ticket_id',
        'group_id',
        'agent_id',
        'source_id',
        'tag_id',
        'is_active',
        'description',
        'created_at',
        'created_by'
    ];

    // public function contact_user(){
    //     return $this->belongsTo(UserDetail::class,'contact_id','id')->withTrashed();
    // }

    public function contact_user(){
        return $this->belongsTo(UserDetail::class,'contact_id','id')->withTrashed()->withDefault([
            'cif_id' => 0,
            'first_name' => '',
            'mobile' => ''
        ]);
    }    

    /* public function contact_user_details(){
        return $this->belongsTo(UserDetail::class,'contact_id','id');
    } */

    public function create_user(){
        // return $this->belongsTo(User::class,'created_by','id');
        return $this->belongsTo(UserDetail::class,'created_by','id')->withTrashed();
    }

    public function agent_user(){
        // return $this->belongsTo(User::class,'agent_id','id');
        return $this->belongsTo(UserDetail::class,'agent_id','id')->withTrashed();
    }

    public function status(){
        return $this->belongsTo(Status::class,'status_id','id');
    }

    public function priority(){
        return $this->belongsTo(Priority::class,'priority_id','id');
    }

    public function group(){
        return $this->belongsTo(Group::class,'group_id','id');
    }

    public function type(){
        return $this->belongsTo(Type::class,'type_id','id');
    }

    public function source(){
        return $this->belongsTo(Source::class,'source_id','id');
    }

    public function question(){
        return $this->hasOne(TicketQuestion::class, 'ticket_id','id');
    }

    public function tag(){
        return $this->belongsTo(Tag::class,'tag_id','id');
    }

    public function notifications(){
        return $this->hasMany(Notification::class,'ticket_id','id');
    }

    /**
     * @author Alif
     * This function need for get ticket group
     */
    public function forward_tickets(){
        return $this->hasOne(TicketForward::class, 'ticket_id','id')->latest();
    }

    public function forwards(){
        return $this->hasMany(TicketForward::class,'ticket_id','id');
    }

/*     public function activeForwards(){
        return $this->forwards()->where('is_active','=', 1);
    } */
    
    public function media()
    {
        return $this->morphMany(Media::class, 'mediable');
    }
    
    public function messages(){
        return $this->hasMany(Message::class);
    }

}
