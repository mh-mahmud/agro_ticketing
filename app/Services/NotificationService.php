<?php

namespace App\Services;

use App\Helpers\Helper;
use App\Repositories\NotificationRepository;
use Illuminate\Support\Facades\Validator;
use DB;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\TicketController;
use App\Models\Status;
use App\Models\Ticket;

class NotificationService
{

    protected $notificationRepository;

    public function __construct(NotificationRepository $notificationRepository)
    {

        $this->notificationRepository = $notificationRepository;

    }

    public function listItems($request)
    {

//        return 'hi';

        DB::beginTransaction();

        try{

            $listing                = $this->notificationRepository->listing($request);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'collections'           => $listing
        ]);
    }

    /**
     * Create Notification
     */
    public function createItem($request){
//        dd($request->all());
        $validator = Validator::make($request->all(),[

            'ticket_id'            => 'required',
            'note'                 => 'required'

        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }

        $data                      = $request->all();
        $data['id']                = Helper::idGenarator();


        if (array_key_exists("seen",$data) == false){
            $data['seen'] = 0;
        }

//        dd($data);


        DB::beginTransaction();

        try {
            
            $notification = $this->notificationRepository->create($data);
            
        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'    => 424,
                'messages'  => config('status.status_code.424'),
                'error'     => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'        => 201,
            'messages'      => config('status.status_code.201'),
            'info'          => $notification
        ]);
    }

    public function deleteItem($id)
    {
        if($id instanceof Request){
            $id = $id->all();
        }
        
        DB::beginTransaction();

        try {

            $this->notificationRepository->delete($id);

        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code' => 424,
                'messages'=>config('status.status_code.424'),
                'error' => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code' => 200,
            'messages'=>config('status.status_code.200')
        ]);
    }

    public function storeNoticeWithUsers($ticketId, $note){

        DB::beginTransaction();

        try {
            
            if( Ticket::find($ticketId) ){
                if(!$users = (new TicketController)->getWhoCanSeeTicket($ticketId)->getData()->user){
                    $users = [];
                }
                $this->notificationRepository->createWithUsers($ticketId, $note, $users);
            }
            
        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'    => 424,
                'messages'  => config('status.status_code.424'),
                'error'     => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'        => 201,
            'messages'      => config('status.status_code.201')
        ]);
    }

    public function getNewNotificationCount(){

        DB::beginTransaction();

        try{

            $notificationCount  = $this->notificationRepository->getNewNotificationCount();

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'data'                  => $notificationCount
        ]);

    }

    public function setNotificationToSeen(){

        DB::beginTransaction();

        try{

            $this->notificationRepository->setNotificationToSeen();

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200')
        ]);

    }
}