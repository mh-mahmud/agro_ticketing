<?php

namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\Ticket;
use App\Helpers\Helper;
use App\Models\BusinessHour;
use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Auth;
use Exception;
use App\Services\SlaService;
use App\Models\Holiday;
use App\Models\Log;
use App\Models\UserDetail;

class TicketRepository
{
    use QueryTrait;

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;
    }

    public function getTicketQuery()
    {

        $query = Ticket::with([
            'status:id,name,slug',
            'priority:id,name',
            'source:id,name',
            'group:id,name',
            'contact_user',
            'create_user',
            'agent_user',
            'media',
            'type.parent',
            'forward_tickets.group'
        ])->select('tickets.*', 'types.name as type_name')
            ->join('types', 'tickets.type_id', '=', 'types.id');

        if (!Auth::user()->can('can-see-all-ticket')) {

            /* $query->leftJoin('ticket_forwards', 'tickets.id', '=', 'ticket_forwards.ticket_id')
                  ->where(function($q){
                      $q->where('ticket_forwards.is_active', 1)
                        ->orWhereNull('ticket_forwards.is_active');
                  })
                  ->where(function($q){
                      $q->where(DB::raw('(CASE WHEN ticket_forwards.agent_id IS NULL THEN tickets.agent_id ELSE ticket_forwards.agent_id END)'), '=', Auth::user()->id)
                        ->orWhere('tickets.contact_id', Auth::user()->id);
                  }); */

            $query->join('tickets_agents', 'tickets.id', '=', 'tickets_agents.ticket_id')
                ->where('tickets_agents.status', '=', '1')
                ->where('tickets_agents.user_id', '=', Auth::user()->id);
        }

        return $query;
    }

    public function getReportTicketQuery()
    {

        $query = Ticket::with([
            'status:id,name,slug',
            'priority:id,name',
            'source:id,name',
            'group:id,name',
            'contact_user',
            'create_user',
            'agent_user',
            'media',
            // 'type.parent',
            'forward_tickets.group'
        ])->select('tickets.*', 'types.name as type_name')
            ->join('types', 'tickets.type_id', '=', 'types.id');

        if (!Auth::user()->can('can-see-all-ticket')) {

            /* $query->leftJoin('ticket_forwards', 'tickets.id', '=', 'ticket_forwards.ticket_id')
                  ->where(function($q){
                      $q->where('ticket_forwards.is_active', 1)
                        ->orWhereNull('ticket_forwards.is_active');
                  })
                  ->where(function($q){
                      $q->where(DB::raw('(CASE WHEN ticket_forwards.agent_id IS NULL THEN tickets.agent_id ELSE ticket_forwards.agent_id END)'), '=', Auth::user()->id)
                        ->orWhere('tickets.contact_id', Auth::user()->id);
                  }); */

            $query->join('tickets_agents', 'tickets.id', '=', 'tickets_agents.ticket_id')
                ->where('tickets_agents.status', '=', '1')
                ->where('tickets_agents.user_id', '=', Auth::user()->id);
        }

        return $query;
    }

    public function listing($request, $needApproval = null)
    {
        $whereFilterList = ['group_id', 'contact_id', 'type_id', 'status_id', 'priority_id', 'created_by', 'source_id', 'agent_id'];
        $likeFilterList  = ['subject', 'account_no', 'card_no', 'id'];

        if ($request->from_date && $request->to_date) {
            $startDate  = $request->from_date;
            $endDate    = $request->to_date;
            if (!Helper::isDateValid($startDate, 'Y-m-d') || !Helper::isDateValid($endDate, 'Y-m-d')) {
                $errors[] = 'Please enter a valid date';
            }
        } else {
            $startDate = date('Y-m-d', strtotime("-" . config('others.MAX_REPORT_DAYS') . " days"));
            $endDate   = date('Y-m-d');
        }

        $query = $this->getTicketQuery()->whereBetween('tickets.created_at', [$startDate . ' 00:00:00', $endDate . " 23:59:59"]);
        if ($needApproval) {
            $query = $query->whereNull('tickets.approved_by');
        } else {
            $query = $query->whereNotNull('tickets.approved_by');
        }

        $field = $request->all();
        $sorting = 'DESC';
        // Searching
        //Search by date
        if (isset($field['created_at']) && $field['created_at']) {
            $query->whereDate('tickets.created_at', $field['created_at']);
        }
        if (count($field) > 0) {
            foreach ($whereFilterList as $key => $value) {
                if (array_key_exists($value, $field) && !empty($field[$value])) {
                    $query->where('tickets.' . $value, '=', $field[$value]);
                }
            }
            foreach ($likeFilterList as $key => $value) {
                if (array_key_exists($value, $field) && !empty($field[$value])) {
                    $query->where('tickets.' . $value, 'like', '%' . $field[$value] . '%');
                }
            }
            if (isset($request->page) && $request->page == "*") {
                $collection = $query->orderBy('tickets.created_at', $sorting)->get();
            } else {
                $collection = $query->orderBy('tickets.created_at', $sorting)->paginate(config('others.ROW_PER_PAGE'));
            }
        } else {
            if (isset($request->page) && $request->page == "*") {
                $collection = $query->orderBy('tickets.created_at', $sorting)->get();
            } else {
                $collection = $query->orderBy('tickets.created_at', $sorting)->paginate(config('others.ROW_PER_PAGE'));
            }
        }

        if ($collection->count()) {
            // SLA Calculation
            $slaService = new SlaService;
            //Get lowest date and highest date
            if ($sorting == 'DESC') {
                $lowestDate  = $collection->last(); // Lowest date
                $highestDate = $collection->first(); // Highest date
            } else {
                $lowestDate  = $collection->first(); // Lowest date
                $highestDate = $collection->last(); // Highest date
            }
            $holidays = array_flip(Holiday::select('date')->whereBetween('date', [$lowestDate->created_at->format('Y-m-d'), $highestDate->created_at->format('Y-m-d')])->get()->pluck('date')->toArray());

            $businessHour       = BusinessHour::with('timeSlots')->first();
            $weeklyBusinessDays = array_map('strtoupper', $businessHour->timeSlots->pluck('day')->toArray());
            $businessHours      = [];

            $businessHour->timeSlots->each(function ($item) use (&$businessHours) {
                $businessHours[$item->day] = [$item->start_time, $item->end_time];
            });

            $collection->each(function ($ticket) use ($slaService, $holidays, $weeklyBusinessDays, $businessHours) {

                $ticket->slaCalculated       = $slaService->calculateSlaTimeLeft($ticket, $holidays, $weeklyBusinessDays, $businessHours);
                $ticket->created_at_formated = date('d-M-Y h:i:s A', strtotime($ticket->created_at));
            });
        }
        return $collection;
    }

    public function getWhoCanSeeTicket($ticketId)
    {

        $whoCanSee = [];
        $ticket = Ticket::findOrFail($ticketId);
        $whoCanSee[] = $ticket->contact_id; // Contact_id user always can see ticket
        $ticket_agents = DB::table('tickets_agents')->where('ticket_id', $ticketId)->where('status', '1')->get()->pluck('user_id')->toArray();

        if (count($ticket_agents)) {
            foreach ($ticket_agents as $agent_id) {
                $whoCanSee[] = $agent_id;
            }
        }

        return User::whereIn('id', $whoCanSee)->get();
    }

    public function show($id)
    {
        $logs = Log::select('previous_data', 'user_id')
            ->where([
                'action'            => 'update',
                'operated_table'    => 'tickets',
                'operated_row_id'   => $id
            ])
            ->whereNotNull('previous_data')
            ->get();
        $ticket = Ticket::with([
            'status:id,name,slug',
            'priority:id,name',
            'source:id,name',
            'group:id,name',
            'contact_user',
            'create_user',
            'agent_user',
            'media',
            'type.parent',
            'question',
            'messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }
        ])->findOrFail($id);
        $current_status_id = $ticket->status->id;
        $statusHistory     = [];
        $statusHistory[]   = ['id' => $current_status_id];
        foreach ($logs as $log) {
            if ($log->previous_data->status_id != $current_status_id) {
                $statusHistory[array_key_last($statusHistory)]['user_id'] = (string)$log->user_id;
                $current_status_id = $log->previous_data->status_id;
                $statusHistory[] = ['id' => $current_status_id];
                if ($log->previous_data->crm_user_name) {
                    $statusHistory[array_key_last($statusHistory)]['crm_user_name'] = $log->previous_data->crm_user_name;
                }
            }
        }

        $statusHistory[array_key_last($statusHistory)]['user_id'] = (string)$ticket->create_user->id;
        if ($ticket->crm_user_name) {
            $statusHistory[array_key_last($statusHistory)]['crm_user_name'] = $ticket->crm_user_name;
        }

        $ticket->statusHistory = array_reverse($statusHistory);
        $ticket->status_users = UserDetail::select('id', 'first_name', 'middle_name', 'last_name')->whereIn('id', array_column($statusHistory, 'user_id'))->get()->keyBy('id');

        return $ticket;
    }

    public function create(array $data)
    {
        $dataObj                = new Ticket();
        $dataObj->id            = $data['id'];
        $dataObj->subject       = $data['subject'];
        $dataObj->contact_id    = $data['contact_id'];
        $dataObj->type_id       = $data['sub_type_id'] ? $data['sub_type_id'] : $data['type_id'];
        $dataObj->status_id     = config('constants.OPEN_STATUS');
        $dataObj->priority_id   = $data['priority_id'];
        $dataObj->group_id      = $data['group_id'] ?? null;
        // $dataObj->agent_id      = $data['agent_id'] ?? null;
        $dataObj->source_id     = $data['source_id'] ?? null;
        $dataObj->tag_id        = $data['tag_id'] ?? null;
        $dataObj->description   = $data['description'] ?? null;
        // $dataObj->remarks       = $data['remarks'] ?? null;
        $dataObj->approved_by   = $data['approved_by'] ?? null;
        $dataObj->crm_user_id   = $data['crm_user_id'] ?? null;
        $dataObj->crm_user_name = $data['crm_user_name'] ?? null;
        $dataObj->created_by    = Auth::user()->id;
        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        $dataObj->save();

        return $data['id'];
    }

    public function update(array $data, $id)
    {
        $dataObj                    = Ticket::findorfail($id);
        $dataObj->subject           = $data['subject'] ?? $dataObj->subject;
        $dataObj->contact_id        = $data['contact_id'] ?? $dataObj->contact_id;
        // $dataObj->account_no        = $data['account_no'] ?? '';
        // $dataObj->card_no           = $data['card_no'] ?? '';
        // $dataObj->cif_id            = $data['cif_id'] ?? '';
        $dataObj->type_id           = $data['sub_type_id'] ? $data['sub_type_id'] : $data['type_id'];
        $dataObj->status_id         = $data['status_id'] ?? $dataObj->status_id;
        $dataObj->priority_id       = $data['priority_id'] ?? $dataObj->priority_id;
        /* If ticket already created the group will not be changed, it can be forward to another group */
        // $dataObj->group_id          = $data['group_id'] ?? $dataObj->group_id;
        $dataObj->source_id         = $data['source_id'] ?? $dataObj->source_id;
        $dataObj->tag_id            = $data['tag_id'] ?? $dataObj->tag_id;
        $dataObj->description       = $data['description'] ?? $dataObj->description;
        // $dataObj->remarks           = $data['remarks'] ?? $dataObj->remarks;
        $dataObj->approved_by       = $data['approved_by'] ?? $dataObj->approved_by;
        $dataObj->updated_at        = Carbon::now()->timestamp;
        $dataObj->save();
        return $dataObj;
    }

    /**
     * Update some fields from ticket reply
     * @param Array, Ticket ID
     */
    public function updateFromReplySection(array $data, $id)
    {
        $dataObj                    = Ticket::findorfail($id);
        $dataObj->type_id           = $data['type_id'] ?? $dataObj->type_id;
        $dataObj->status_id         = $data['status_id'] ?? $dataObj->status_id;
        $dataObj->priority_id       = $data['priority_id'] ?? $dataObj->priority_id;
        $dataObj->save();
        return $dataObj;
    }

    /**
     * Reopen Closed Ticket
     * @param Ticket ID
     */
    public function reopen($id)
    {
        $dataObj              = Ticket::findorfail($id);
        if ($openStatus = DB::table('statuses')->where('slug', 'open')->first()) {

            $dataObj->status_id   = $openStatus->id;
            $dataObj->save();
            return $dataObj;
        }
        throw new Exception('Open status not found !');
    }

    public function delete($id)
    {
        if ($ticket = Ticket::find($id)) {
            Message::where('ticket_id', $id)->delete();

            /* Delete From folder */
            $allMedia = $ticket->media()->get();
            // Delete Media and file
            foreach ($allMedia as $media) {
                $path = parse_url($media->url)['path'];
                $media->delete();
                if (file_exists(public_path($path))) {
                    unlink(public_path($path));
                }
            }
            /* End Delete From folder */

            return $ticket->delete();
        }
        return false;
    }

    public function approve($id)
    {
        if ($ticket = Ticket::find($id)) {
            $ticket->approved_by = Auth::user()->id;
            $ticket->save();
        }
        return false;
    }
}
