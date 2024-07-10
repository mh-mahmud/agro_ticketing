<?php
namespace App\Repositories;

use App\Http\Traits\QueryTrait;
use App\Models\TicketForward;
use App\Helpers\Helper;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Auth;

class TicketForwardRepository
{
    use QueryTrait;

    public function listing($request)
    {
        if ($request->filled('query')) {
            $query = TicketForward::with('tickets');
            $likeFilterList = ['message'];
            $whereFilterList = ['message'];
            $query = self::filterTask($request, $query, $whereFilterList, $likeFilterList);
            return $query->orderBy('created_at', 'DESC')->paginate(15);
        } else {
            return TicketForward::with('tickets')->orderBy('created_at', 'DESC')->paginate(15);
        }
    }

    public function show($id)
    {

        return TicketForward::with(
            'tickets:id,subject',
            'messages'
        )->findOrFail($id);
    }

    public function create(array $data)
    {
        
        if(isset($data['agent_id'])){
            $groupAgentIds = $data['agent_id'];
        }else{
            $groupAgentIds = DB::table('groups_agents')->where('group_id',$data['group_id'])->pluck('user_id')->toArray();
        }

        if( !count($groupAgentIds) ){
            return false; // No agents
        }

        foreach ($groupAgentIds as $agent_id) {
            $dataObj                = new TicketForward();
            $dataObj->id            = Helper::idGenarator();
            $dataObj->ticket_id     = $data['ticket_id'];
            $dataObj->group_id      = $data['group_id'];
            // $dataObj->agent_id      = $agent_id;
            $dataObj->forward_by    = Auth::user()->id;
            $dataObj->created_at    = Carbon::now()->timestamp;
            $dataObj->updated_at    = Carbon::now()->timestamp;
            $dataObj->save();
        }
        
        return $groupAgentIds;

    }

    public function update(array $data, $id)
    {
        /* $dataObj            = TicketForward::findorfail($id);
        $dataObj->ticket_id = $data['ticket_id'];
        $dataObj->message   = $data['message'];
        //        $dataObj->created_at    = Carbon::now()->timestamp;
        $dataObj->updated_at    = Carbon::now()->timestamp;
        return $dataObj->save(); */
    }

    public function delete($id)
    {
        return TicketForward::find($id)->delete();
    }

    public static function filterTask($request, $query, array $whereFilterList, array $likeFilterList)
    {
        $query = self::likeQueryFilter($request, $query, $likeFilterList);
        $query = self::whereQueryFilter($request, $query, $whereFilterList);

        return $query;
    }
}
