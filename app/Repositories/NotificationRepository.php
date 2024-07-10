<?php

namespace App\Repositories;

use App\Models\Notification;
use Auth;
use App\Helpers\Helper;
use App\Models\NotificationUser;

class NotificationRepository
{

    public function listing($request)
    {

        $query = Notification::with('ticket');

        if(!Auth::user()->can('all-notification') ){
            // User wise notification
            $query->join('notification_users', 'notification_users.notification_id', 'notifications.id')
                  ->where('notification_users.user_id', Auth::user()->id);
        }else{
            if ($request->filled('query')){

                $query =  $query->where(function ($q) use ($request)
                {
                    $q->whereHas('ticket', function ($sq) use ($request){
                        $sq->where('group_id',$request['query'])
                            ->where('group_id', "=", $request['query']);
                    });
                });
            }
        }

        return $query->orderBy('created_at','DESC')->paginate(config('others.ROW_PER_PAGE'));

    }

    public function create($data){

        $dataObj = new Notification;
        $dataObj->id            = $data['id'];
        $dataObj->ticket_id     = $data['ticket_id'];
        $dataObj->note          = $data['note'];
        $dataObj->seen          = $data['seen'];// By default unseen
        $dataObj->save();
        return $dataObj;

    }

    public function createWithUsers($ticketId, $note, $users){

        // Create Notification
        $notification_id = Helper::idGenarator();
        $notification = Notification::create(array(
            'id'        => $notification_id,
            'ticket_id' => $ticketId,
            'note'      => $note
        ));
        if($notification && count($users)){
            foreach($users as $user){
                NotificationUser::create([
                    'notification_id' => $notification_id,
                    'user_id'         => $user->id
                ]);
            }
        }
        return true;
        
    }

    /**
     * If a notification has more than one user then only delete from notification_users by auth user id, otherwise delete whole notification
     */
    public function delete($ids){
        if(!is_array($ids)){
            $ids = (Array)$ids;
        }
        foreach($ids as $id){
            NotificationUser::where(['user_id'=>Auth::user()->id, 'notification_id'=>$id])->delete();
            if( !$this->anyDependencyForDelete($id) ){
                // Delete notification forever (Hard delete)
                Notification::find($id)->delete();
            }
        }
        return 1;
    }

    /**
     * Check if notification has one or more user
     * @return Boolean
     */
    public function anyDependencyForDelete($notification_id){
        return NotificationUser::where('notification_id', $notification_id)->get()->groupBy('user_id')->count();
    }

    public function getNewNotificationCount(){
        return NotificationUser::where(['user_id'=>Auth::user()->id, 'seen'=>0])->get()->count();
    }

    public function setNotificationToSeen(){
        return NotificationUser::where('user_id', Auth::user()->id)->update(['seen'=>1]);
    }
}