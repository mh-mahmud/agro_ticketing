<?php

namespace App\Services;

use App\Helpers\Helper;
use App\Http\Controllers\Api\TicketController;
use App\Models\Ticket;
use App\Repositories\TicketRepository;
use App\Repositories\TicketQuestionRepository;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Services\GroupService;
use App\Models\NotificationUser;
use App\Models\Notification;
use App\Models\Group;
use App\Http\Controllers\MailController;
use App\Exports\Export;
use Excel;
use App\Helpers\EmailHelper;

class TicketService
{
    protected $repository;

    public function __construct()
    {

        $this->repository             = new TicketRepository;;
    }

    public function listItems($request, $needApproval = null)
    {
        DB::beginTransaction();

        try {

            $listing = $this->repository->listing($request, $needApproval);
        } catch (Exception $e) {

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

    public function ticketDownloadCsv($request)
    {
        if (!Helper::isDateValid($request->from_date, 'Y-m-d') || !Helper::isDateValid($request->to_date, 'Y-m-d')) {
            $request->from_date = date('Y-m-d', strtotime("-" . config('others.MAX_REPORT_DAYS') . " days"));
            $request->to_date   = date('Y-m-d');
        }

        $reportData = $this->listItems($request, null)->getData();

        $heading = [[
            'ID',
            'Mobile',
            'Account No.',
            'Card No.',
            'CIF ID',
            'Category',
            'Sub Category',
            'Priority',
            'Source',
            'Created By',
            'Created At',
            'Last Update',
            'Status'
        ]];

        $data = array_map(function ($ticket) {
            $description = '';
            $last_update_info = DB::table('messages')->select('message')->where('ticket_id', $ticket->id) ->orderBy('created_at', 'desc')->first();
            if(!empty($ticket->description)) {
                $description = strip_tags($ticket->description);
                $description = str_replace('&nbsp;', ' ', $description);
                $description = str_replace('&amp;', ' & ', $description);

            }
            return [
                'id'            => $ticket->id,
                'mobile'        => $ticket->contact_user->mobile,
                'account_no'    => isset($ticket->account_no) ? $ticket->account_no : "-",
                'card_no'       => isset($ticket->card_no) ? $ticket->card_no : "-",
                'cif_no'        => isset($ticket->cif_id) ? $ticket->cif_id : "-",
                'type'          => isset($ticket->type->parent) ? $ticket->type->parent->name : $ticket->type->name,
                'sub_type'      => isset($ticket->type->parent) ? $ticket->type->name : "-",
                'priority'      => $ticket->priority->name,
                'source'        => isset($ticket->source) ? $ticket->source->name : '',
                'crm_user_name' => $ticket->crm_user_name,
                'created_at'    => $ticket->created_at_formated,
                'last_update_info' => !empty($last_update_info->message) ? $last_update_info->message : $description,
                'status'        => $ticket->status->name . '-' . $ticket->group->name,
            ];
        }, $reportData->collections);
        $data = array_merge($heading, $data);

        return Excel::download(new Export($data), "Ticket list for {$request->from_date} to {$request->to_date}.csv");
    }

    public function createItem($request)
    {
        $validator = Validator::make($request->all(), [

            'subject'                 => 'required|string|min:3|max:200',
            'type_id'                 => 'required',
            // 'status_id'               => 'required',
            'priority_id'             => 'required',
            // 'contact_id'              => 'required',
            'group_id'                => 'required',

        ], [

            'subject.required'        => 'Subject required',
            'subject.string'          => 'Subject must be string',
            'subject.min'             => 'Subject minimum length 3',
            'subject.max'             => 'Subject maximum length 200',
            // 'contact_id.required'     => 'Contact required',
            'type_id.required'        => 'Type required',
            // 'status_id.required'      => 'Status required',
            'priority_id.required'    => 'Priority required',
            'group_id.required'       => 'Group required'

        ]);

        if ($validator->fails()) {

            return response()->json([
                'status_code'       => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);
        }

        $data = $request->all();
        $groupService = new GroupService;

        $group = Group::select('id', 'name')->with('users:id')->where('groups.id', $data['group_id'])->first();
        if (!isset($group->users) || !count($group->users)) {
            return response()->json([
                'status'       => 424,
                'messages'     => config('status.status_code.424'),
                'errors'       => ["{$group->name} group has no member! Add member first."]
            ]);
        }

        // Check if this group has need ticket approval
        if ($groupService->searchTreeByGroupId($data['group_id'], $groupService->getGroupTree())['need_ticket_approval'] == 0) {
            $data['approved_by'] = 0; //no need to approve
        }

        $data['id'] = Helper::idGenarator();

        DB::beginTransaction();

        try {
            if (isset($request->files) && $error = $this->filesValidate($request->files)) {
                throw new Exception("These files are not allowed : " . implode(', ', $error));
            }

            $ticketId = $this->repository->create($data);
            // if($ticketId) {
            //     $this->repository->addUserDetails($data);

            // }

            if ($data['question_id']) {
                (new TicketQuestionRepository)->create([
                    'ticket_id'     => $ticketId,
                    'question_id'   => $data['question_id'],
                    'answer'        => $data['answer']
                ]);
            }

            Helper::storeLog([
                'action'            => 'insert',
                'operated_table'    => 'tickets',
                'operated_row_id'   => $ticketId
            ]);

            // Create Notification
            $notification_id = Helper::idGenarator();
            Notification::create(array(
                'id'        => $notification_id,
                'ticket_id' => $data['id'],
                'note'      => 'New Ticket Created'
            ));

            // Send notification to contact id
            // Need to fix later start
            NotificationUser::create([
                'notification_id' => $notification_id,
                'user_id'         => $data['contact_id']
            ]);
            // Need to fix later start

            if (isset($data['agent_id'])) {
                $groupAgentIds[] = $data['agent_id'];
            } else {
                $groupAgentIds = DB::table('groups_agents')->where('group_id', $data['group_id'])->pluck('user_id')->toArray();
            }

            //Save ticket agents and notifications
            foreach ($groupAgentIds as $agent_id) {

                DB::table('tickets_agents')->insert([
                    'id'        => Helper::idGenarator(),
                    'ticket_id' => $ticketId,
                    'user_id'   => $agent_id,
                    'created_at' => date('Y-m-d H:i:s')
                ]);

                // Need to fix later start
                if ($data['contact_id'] != $agent_id) { // Contact id notice already sended
                    NotificationUser::create([
                        'notification_id' => $notification_id,
                        'user_id'         => $agent_id
                    ]);
                }
                // Need to fix later end
            }

            $ticket = Ticket::with('contact_user')->find($ticketId);

            // Files
            if (isset($request->files)) {
                foreach ($request->files as $files) {
                    foreach ($files as $file) {
                        $filePath = Helper::fileUpload("media/ticket/", $file);
                        $ticket->media()->create([

                            'url'           => $filePath

                        ]);
                    }
                }
            }

            // dd($filePath);

            //Send mail
            $emails = DB::table('users')
                ->join('user_details', 'users.id', '=', 'user_details.id')
                ->select('email')
                ->whereIn('users.id', $groupAgentIds)
                ->get()
                ->pluck('email')
                ->toArray();

            $fullName = $ticket->contact_user->first_name . ' ' . $ticket->contact_user->middle_name . ' ' . $ticket->contact_user->last_name;
            $appUrl = config('others.APP_BASE_URL');
            $subject = "New Ticket Arrived";

            $mailBody = <<<BODY
            <!DOCTYPE html>
            <html>
                <body>
                    Hello,
                    <br>
                    Please take a look at ticket #{$ticketId} raised by {$fullName} ({$ticket->contact_user->email}).
                    <br>
                    Please click the link bellow.
                    <br>
                    <a target="_blank" href="{$appUrl}/tickets/reply/{$ticketId}">{$ticketId}</a>
                    <br>
                    Thank you.
                </body>
            </html>
BODY;
            EmailHelper::sendEmail($emails, $subject, $mailBody);

//             (new MailController(
//                 $emails,
//                 'New Ticket Arrived',
//                 $mailBody,
//                 ['address' => config('others.MAIL.FROM'), 'head' => 'New Ticket #' . $ticketId]
//             ))->send();
        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'errors'             => [$e->getMessage()]
            ]);
        }

        DB::commit();

        return response()->json([
            'status'           => 201,
            'messages'              => config('status.status_code.201'),
            'info'                  => $ticket
        ]);
    }

    public function updateItem($request, $id)
    {
        $validator = Validator::make($request->all(), [

            'subject'               => 'required|string|min:3|max:200',
            'type_id'               => 'required',
            'status_id'             => 'required',
            'priority_id'           => 'required',
            'contact_id'            => 'required',

        ], [

            'subject.required'      => 'Subject required',
            'subject.string'        => 'Subject must be string',
            'subject.min'           => 'Subject minimum length 3',
            'subject.max'           => 'Subject maximum length 200',
            'contact_id.required'   => 'Contact required',
            'type_id.required'      => 'Type required',
            'status_id.required'    => 'Status required',
            'priority_id.required'  => 'Priority required',
            'group_id.required'     => 'Group required'

        ]);

        if ($validator->fails()) {

            return response()->json([
                'status'   => 400,
                'messages' => config('status.status_code.400'),
                'errors'   => $validator->errors()->all()
            ]);
        }

        $data                       = $request->all();

        DB::beginTransaction();

        try {

            if (isset($request->files) && $error = $this->filesValidate($request->files)) {
                throw new Exception("These files are not allowed : " . implode(', ', $error));
            }

            $ticketLog = Ticket::findOrFail($id);

            // Check if group has member or not
            /* if(!isset($group->users) || !count($group->users)){
                return response()->json([
                    'status'       => 424,
                    'messages'     => config('status.status_code.424'),
                    'errors'       => ["{$group->name} group has no member! Add member first."]
                ]);
            } */

            $ticket = $this->repository->update($data, $id);

            if ($data['pre_question_id'] && $data['question_id']) {
                //Update
                (new TicketQuestionRepository)->update([
                    'ticket_id'         => $ticket->id,
                    'pre_question_id'   => $data['pre_question_id'],
                    'question_id'       => $data['question_id'],
                    'answer'            => $data['answer'] ?? ''
                ]);
            } elseif ($data['question_id']) {

                //Insert new
                if (!DB::table('ticket_questions')->where([
                    'ticket_id'     => $ticket->id,
                    'question_id'   => $data['question_id']
                ])->first()) {
                    (new TicketQuestionRepository)->create([
                        'ticket_id'     => $ticket->id,
                        'question_id'   => $data['question_id'],
                        'answer'        => $data['answer']
                    ]);
                }
            } else {
                // Delete
                (new TicketQuestionRepository)->delete([
                    'ticket_id'     => $ticket->id,
                    'pre_question_id'   => $data['pre_question_id']
                ]);
            }

            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'tickets',
                'operated_row_id'   => $ticketLog->id,
                'previous_data'     => json_encode($ticketLog)
            ]);


            // Create Notification
            $notification_id = Helper::idGenarator();
            Notification::create(array(
                'id'        => $notification_id,
                'ticket_id' => $ticket->id,
                'note'      => 'Ticket Updated'
            ));

            // Send notification to contact id
            $contactId = $data['contact_id'] ?? $ticketLog->contact_id;
            NotificationUser::create([
                'notification_id' => $notification_id,
                'user_id'         => $contactId
            ]);

            // Change status for previous agents
            /* DB::table('tickets_agents')->where('ticket_id', $ticket->id)->update([
                'status' => '0'
            ]); */

            if (!$users = (new TicketController)->getWhoCanSeeTicket($id)->getData()->user) {
                $users = [];
            }

            //Save ticket agents and notifications
            foreach ($users as $user) {

                /* DB::table('tickets_agents')->insert([
                    'id'        => Helper::idGenarator(),
                    'ticket_id' => $ticket->id,
                    'user_id'   => $groupUser->id,
                    'created_at'=> date('Y-m-d H:i:s')
                ]); */

                if ($contactId != $user->id) { // Contact id notice already sended
                    NotificationUser::create([
                        'notification_id' => $notification_id,
                        'user_id'         => $user->id
                    ]);
                }
            }

            if (isset($request->givenFilesContainer)) {
                $givenFiles = json_decode($request->givenFilesContainer);
                $filesForNotBeDelete = [];
                foreach ($givenFiles as $givenFile) {
                    array_push($filesForNotBeDelete, array_reverse(explode('/', parse_url($givenFile->url)['path']))[0]);
                }
            }

            $allMedia = $ticket->media()->get();

            // Delete Media
            foreach ($allMedia as $media) {
                $path = parse_url($media->url)['path'];
                $fileName = array_reverse(explode('/', parse_url($media->url)['path']))[0];
                if (isset($filesForNotBeDelete) && !in_array($fileName, $filesForNotBeDelete)) {
                    $media->delete();
                    if (file_exists(public_path($path))) {
                        unlink(public_path($path));
                    }
                }
            }

            if (isset($request->files)) {
                foreach ($request->files as $files) {
                    foreach ($files as $file) {
                        $filePath           = Helper::fileUpload("media/ticket/", $file);
                        $ticket->media()->create([
                            'url'           => $filePath
                        ]);
                    }
                }
            }
        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 424,
                'messages'          => config('status.status_code.424'),
                'errors'             => [$e->getMessage()]
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'message'               => config('status.status_code.200'),
            'ticket'                => $ticket
        ]);
    }

    public function filesValidate($requestFiles)
    {

        $allow_mime_type = config('others.ALLOW_MIME_TYPE');
        $error = false;
        foreach ($requestFiles as $files) {
            foreach ($files as $file) {
                if (!in_array($file->getMimeType(), $allow_mime_type)) {
                    $error[] = $file->getClientOriginalName();
                }
            }
        }
        return $error;
    }
    /**
     * Update some fields from ticket reply
     * @param Request, Ticket ID
     */
    public function updateFromReplySection($request, $id)
    {
        $validator = Validator::make($request->all(), [

            'type_id'                 => 'required',
            'status_id'               => 'required',
            'priority_id'             => 'required'

        ], [

            'type_id.required'        => 'Type required',
            'status_id.required'      => 'Status required',
            'priority_id.required'    => 'Priority required'

        ]);

        if ($validator->fails()) {

            return response()->json([
                'status'            => 400,
                'messages'          => config('status.status_code.400'),
                'errors'            => $validator->errors()->all()
            ]);
        }

        $data                       = $request->all();

        DB::beginTransaction();

        try {

            $ticketLog = Ticket::findOrFail($id);

            $ticket              = $this->repository->updateFromReplySection($data, $id);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'tickets',
                'operated_row_id'   => $ticketLog->id,
                'previous_data'     => json_encode($ticketLog)
            ]);

            // Create Notification
            $notification_id = Helper::idGenarator();
            Notification::create(array(
                'id'        => $notification_id,
                'ticket_id' => $ticket->id,
                'note'      => 'Ticket Updated'
            ));

            // Send notification to contact id
            $contactId = $data['contact_id'] ?? $ticketLog->contact_id;
            NotificationUser::create([
                'notification_id' => $notification_id,
                'user_id'         => $contactId
            ]);

            if (!$users = (new TicketController)->getWhoCanSeeTicket($id)->getData()->user) {
                $users = [];
            }

            //Save ticket agents and notifications
            foreach ($users as $user) {

                if ($contactId != $user->id) { // Contact id notice already sended
                    NotificationUser::create([
                        'notification_id' => $notification_id,
                        'user_id'         => $user->id
                    ]);
                }
            }
        } catch (Exception $e) {

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
            'ticket'                => $ticket
        ]);
    }

    /**
     * Reopen closed ticket
     * @param Ticket ID
     */
    public function reopen($ticketId)
    {

        DB::beginTransaction();

        try {

            $ticketLog = Ticket::findOrFail($ticketId);

            $ticket = $this->repository->reopen($ticketId);
            Helper::storeLog([
                'action'            => 'update',
                'operated_table'    => 'tickets',
                'operated_row_id'   => $ticketLog->id,
                'note'              => 'Ticket reopend'
            ]);
        } catch (Exception $e) {

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
            'ticket'                => $ticket
        ]);
    }

    public function showItem($id)
    {

        DB::beginTransaction();

        try {

            $ticket                   = $this->repository->show($id);
            $ticket->created_at_formed = date('d-M-Y h:i:s A', strtotime($ticket->created_at));
        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 404,
                'messages'          => config('status.status_code.404'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'message'               => config('status.status_code.200'),
            'ticket_info'           => $ticket
        ]);
    }


    public function deleteItem($id)
    {
        DB::beginTransaction();

        try {

            $ticketLog = Ticket::with('question')->findOrFail($id);

            $this->repository->delete($id);
            Helper::storeLog([
                'action'            => 'delete',
                'operated_table'    => 'tickets',
                'operated_row_id'   => $ticketLog->id,
                'previous_data'     => json_encode($ticketLog)
            ]);
        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code' => 424,
                'messages' => config('status.status_code.424'),
                'error' => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code' => 200,
            'messages' => config('status.status_code.200')
        ]);
    }

    public function saveFiles($request)
    {

        if (isset($request->file)) {

            return response()->json([

                'status_code' => 200,
                'messages'    => config('status.status_code.200'),
                'file_path'   => Helper::base64MediaUpload($request->attachment_save_path, $request->file)

            ]);
        }
    }

    public function approveTicket($id)
    {
        DB::beginTransaction();

        try {

            $this->repository->approve($id);
        } catch (Exception $e) {

            DB::rollBack();

            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status_code' => 424,
                'messages' => config('status.status_code.424'),
                'error' => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status_code' => 200,
            'messages' => config('status.status_code.200')
        ]);
    }

    public function getWhoCanSeeTicket($ticketId)
    {
        DB::beginTransaction();

        try {

            $user                   = $this->repository->getWhoCanSeeTicket($ticketId);
        } catch (Exception $e) {

            DB::rollBack();
            Log::error('Found Exception: ' . $e->getMessage() . ' [Script: ' . __CLASS__ . '@' . __FUNCTION__ . '] [Origin: ' . $e->getFile() . '-' . $e->getLine() . ']');

            return response()->json([
                'status'            => 404,
                'messages'          => config('status.status_code.404'),
                'error'             => $e->getMessage()
            ]);
        }

        DB::commit();

        return response()->json([
            'status'                => 200,
            'message'               => config('status.status_code.200'),
            'user'                  => $user
        ]);
    }
}
