<?php

namespace App\Services;
use App\Helpers\Helper;
use App\Repositories\TicketForwardRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\NotificationUser;
use App\Models\Notification;
use App\Repositories\GroupRepository;
use Carbon\Carbon;
use App\Http\Controllers\MailController;
use App\Models\Ticket;
use App\Helpers\EmailHelper;

class TicketForwardService
{
    protected $repository;

    public function __construct(TicketForwardRepository $repository)
    {

        $this->repository             = $repository;

    }

    public function listItems($request)
    {

        DB::beginTransaction();

        try{

            $collections              = $this->repository->listing($request);

        }catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'             => 424,
                'messages'           => config('status.status_code.424'),
                'error'              => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'messages'              => config('status.status_code.200'),
            'collections'           => $collections
        ]);
    }

    public function showItem($id)
    {

        DB::beginTransaction();

        try{

            $info                   = $this->repository->show($id);

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
            'message'               => config('status.status_code.200'),
            'info'                  => $info
        ]);
    }

    public function createItem($request)
    {
        $data                      = $request->all();

        DB::beginTransaction();

        try {
            
            $validator = Validator::make($request->all(),[

                'ticket_id'     => 'required',
                'group_id'      => 'required',
        
            ]);

            if($validator->fails()) {

                return response()->json([
                    'status_code'   => 400,
                    'messages'      => config('status.status_code.400'),
                    'errors'        => $validator->errors()->all()
                ]);

            }
            
            //Check forwarded group and existing group
            if(!isset($data['agent_id']) && (new GroupRepository)->getTicketAssignedGroup($request->ticket_id)->id == $request->group_id){
                return response()->json([
                    'status_code'   => 424,
                    'messages'      => config('status.status_code.424'),
                    'errors'        => ['The ticket is already in this group!']
                ]);
            }

            if(!$groupAgentIds = $this->repository->create($data)){// If no agents in the group
                return response()->json([
                    'status_code'   => 424,
                    'messages'      => config('status.status_code.424'),
                    'errors'        => ['Failed! This group has no member!']
                ]);
            }
            
            // Change status for previous agents
            DB::table('tickets_agents')->where('ticket_id', $request->ticket_id)->update([
                'status' => '0'
            ]);

            // Create notification
            $noti_id = Helper::idGenarator();
            Notification::create(array(
                'id'        => $noti_id,
                'ticket_id' => $data['ticket_id'],
                'note'      => 'Ticket Forwarded'
            ));

            foreach($groupAgentIds as $agent_id){
                
                //Forwards to another group users
                DB::table('tickets_agents')->insert([
                    'id'        => Helper::idGenarator(),
                    'ticket_id' => $request->ticket_id,
                    'user_id'   => $agent_id,
                    'created_at'=> date('Y-m-d H:i:s')
                ]);

                NotificationUser::create([
                    'notification_id' => $noti_id,
                    'user_id'         => $agent_id
                ]);
            }
            // Send mail notification to assigned agents
            $emails = DB::table('users')
                    ->join('user_details', 'users.id', '=', 'user_details.id')
                    ->select('email')
                    ->whereIn('users.id', $groupAgentIds)
                    ->get()
                    ->pluck('email')
                    ->toArray();

            $ticket = Ticket::with('contact_user')->find($request->ticket_id);
            $fullName = $ticket->contact_user->first_name . ' ' . $ticket->contact_user->middle_name . ' ' . $ticket->contact_user->last_name;
            $appUrl = config('others.APP_BASE_URL');
            $subject = 'Forwarded Ticket';
            $mailBody = <<<BODY
            <!DOCTYPE html>
            <html>
                <body>
                    Hello,
                    <br>
                    Please take a look at ticket #{$request->ticket_id} raised by {$fullName} ({$ticket->contact_user->email}).
                    <br>
                    Please click the link bellow.
                    <br>
                    <a target="_blank" href="{$appUrl}/tickets/reply/{$request->ticket_id}">{$request->ticket_id}</a>
                    <br>
                    Thank you.
                </body>
            </html>
BODY;

            // (new MailController(
            //     $emails,
            //     'Forwarded Ticket',
            //     $mailBody,
            //     ['address'=>config('others.MAIL.FROM'), 'head'=>'Forwarded Ticket #' . $request->ticket_id]
            // ))->send();

            EmailHelper::sendEmail($emails, $subject, $mailBody);

        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'errors'            => [$e->getMessage()]
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code'           => 201,
            'messages'              => config('status.status_code.201'),
            //'info'                  => $info
        ]);
    }



    public function updateItem($request,$id)
    {
        /* $validator = Validator::make($request->all(),[
            'ticket_id'               => 'required',
            'message'            => 'required',
           
        ],[
            'ticket_id.required'     => 'Ticket required',
            'message.required'   => 'Message required',
        ]);

        if($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);

        }

        $data                      = $request->all();
        // $data['slug']              = Helper::slugify($data['title']);
        // if (isset($data['name'])){
        //     $data['slug']           = Helper::slugify($data['name']);
        // }


        DB::beginTransaction();

        try {

            $this->repository->update($data, $id);
            $info                   = $this->repository->show($id);


        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code'       => 424,
                'messages'          => config('status.status_code.424'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code'           => 200,
            'messages'              => config('status.status_code.200'),
            'info'                  => $info
        ]); */

    }


    public function deleteItem($id)
    {
        /* DB::beginTransaction();

        try {

            $this->repository->delete($id);

        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code' => 424,
                'messages'=>config('status.status_code.424'),
                'error' => $e->getMessage()]);
        }

        DB::commit();

        return response()->json([
            'status_code' => 200,
            'messages'=>config('status.status_code.200')
        ]); */
    }

}